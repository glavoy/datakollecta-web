import { supabase } from "@/lib/supabase";
import { SurveyPackage } from "@/types/survey";
import { generateManifestGistx, generateFormXml } from "@/lib/xmlGenerator";
import JSZip from "jszip";

export const surveyService = {
  /**
   * Saves the survey package (forms/CRFs) to a new survey_packages record.
   * Creates a new survey version with display_name and name.
   */
  async saveSurveyPackage(
    pkg: SurveyPackage,
    projectId: string,
    userId: string,
    surveyDisplayName: string,
    surveyName: string,
    status: 'draft' | 'active' | 'ready' = 'draft'
  ) {
    // 1. Generate the Zip content
    const zip = new JSZip();
    const manifestJson = generateManifestGistx(pkg);
    zip.file('survey_manifest.gistx', manifestJson);

    pkg.forms.forEach(form => {
      const xml = generateFormXml(form);
      zip.file(`${form.tablename}.xml`, xml);
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });

    // 2. Upload Zip to Storage (Bucket: 'surveys')
    const date = new Date().toISOString().split('T')[0];
    const sanitizedName = surveyName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = `${projectId}/${sanitizedName}_v${pkg.version}_${date}_${Date.now()}.zip`;

    const { error: uploadError } = await supabase.storage
      .from('surveys')
      .upload(filePath, zipBlob);

    if (uploadError) throw uploadError;

    // 3. Create or update 'survey_packages' table record
    const { data: surveyPackage, error: surveyError } = await supabase
      .from('survey_packages')
      .upsert({
        id: pkg.id, // Use existing ID if updating, or new UUID if creating
        project_id: projectId,
        name: sanitizedName,
        display_name: surveyDisplayName,
        version_date: new Date().toISOString().split('T')[0],
        description: null, // Optional description field
        manifest: JSON.parse(manifestJson),
        zip_file_path: filePath,
        status: status,
        created_by: userId,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (surveyError) throw surveyError;

    // 4. Update/Insert individual CRFs (linked to survey_package)
    for (const form of pkg.forms) {
      const { error: crfError } = await supabase
        .from('crfs')
        .upsert({
          id: form.id,
          survey_package_id: surveyPackage.id, // NEW: Link to survey package
          project_id: projectId,
          table_name: form.tablename,
          display_name: form.displayname,
          display_order: form.displayOrder,
          parent_table: form.parenttable,
          linking_field: form.linkingfield,
          id_config: form.idconfig, // Fix: use 'idconfig' from type
          display_fields: form.displayFields,
          fields: form.questions, // JSONB column
          auto_start_repeat: form.autoStartRepeat,
          repeat_enforce_count: form.repeatEnforceCount,
        });

      if (crfError) throw crfError;
    }

    return surveyPackage;
  },

  /**
   * Loads the survey package for a specific survey_package_id.
   * Returns the survey with all its CRFs/questionnaires.
   */
  async getSurveyPackage(surveyPackageId: string): Promise<SurveyPackage> {
    // 1. Fetch the survey package
    const { data: survey, error: surveyError } = await supabase
      .from('survey_packages')
      .select('*, projects(name)')
      .eq('id', surveyPackageId)
      .single();

    if (surveyError) throw surveyError;

    // 2. Fetch the CRFs associated with this survey package
    const { data: crfs, error: crfsError } = await supabase
      .from('crfs')
      .select('*')
      .eq('survey_package_id', surveyPackageId)
      .order('display_order');

    if (crfsError) throw crfsError;

    // 3. Construct the SurveyPackage object
    return {
      id: survey.id,
      name: survey.display_name, // Use display_name for user-friendly name
      version: '1.0', // Version is now tracked by version_date
      forms: (crfs || []).map(crf => ({
        id: crf.id,
        tablename: crf.table_name,
        displayname: crf.display_name,
        displayOrder: crf.display_order,
        parenttable: crf.parent_table,
        linkingfield: crf.linking_field,
        displayFields: crf.display_fields,
        idconfig: crf.id_config,
        questions: crf.fields || [],
        autoStartRepeat: crf.auto_start_repeat || 0,
        repeatEnforceCount: crf.repeat_enforce_count || 1,
        primaryKey: crf.primary_key,
      }))
    };
  },

  /**
   * Gets the most recent active survey package for a project.
   * Useful for loading the latest survey version.
   */
  async getLatestSurveyForProject(projectId: string): Promise<SurveyPackage | null> {
    // Fetch the most recent survey package
    const { data: survey, error: surveyError } = await supabase
      .from('survey_packages')
      .select('*')
      .eq('project_id', projectId)
      .order('version_date', { ascending: false })
      .limit(1)
      .single();

    if (surveyError) {
      if (surveyError.code === 'PGRST116') {
        // No survey found
        return null;
      }
      throw surveyError;
    }

    return this.getSurveyPackage(survey.id);
  },

  /**
   * Gets all survey packages for a project.
   * Returns list of all versions.
   */
  async getAllSurveysForProject(projectId: string) {
    const { data: surveys, error } = await supabase
      .from('survey_packages')
      .select('*, crfs(count)')
      .eq('project_id', projectId)
      .order("version_date", { ascending: false });

    if (error) throw error;
    return surveys || [];
  },

  /**
   * Fetch ALL surveys across ALL projects.
   */
  async getAllSurveys() {
    const { data: surveys, error } = await supabase
      .from('survey_packages')
      .select('*, projects(name), crfs(count)')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return surveys || [];
  },

  /**
   * Generates a signed download URL for a survey package zip file.
   * valid for 1 hour.
   */
  async getSurveyDownloadUrl(filePath: string): Promise<string | null> {
    const { data, error } = await supabase.storage
      .from('surveys')
      .createSignedUrl(filePath, 3600);

    if (error) {
      console.error('Error generating download URL:', error);
      return null;
    }

    return data.signedUrl;
  }
};