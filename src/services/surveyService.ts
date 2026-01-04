import { supabase } from "@/lib/supabase";
import { SurveyPackage } from "@/types/survey";
import { generateManifestGistx, generateFormXml } from "@/lib/xmlGenerator";
import JSZip from "jszip";

export const surveyService = {
  /**
   * Saves the survey protocol (forms/CRFs) directly to the Project.
   * This updates the 'projects' table with the zip/manifest and the 'crfs' table with the form definitions.
   */
  async saveSurveyPackage(pkg: SurveyPackage, projectId: string, userId: string) {
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
    // Naming convention: project_slug_version_date.zip or similar
    const date = new Date().toISOString().split('T')[0];
    const sanitizedName = pkg.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = `${projectId}/${sanitizedName}_v${pkg.version}_${date}_${Date.now()}.zip`;
    
    const { error: uploadError } = await supabase.storage
      .from('surveys')
      .upload(filePath, zipBlob);

    if (uploadError) throw uploadError;

    // 3. Update 'projects' table with the new protocol info
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .update({
        version: pkg.version,
        manifest: JSON.parse(manifestJson),
        zip_file_path: filePath,
        updated_at: new Date().toISOString(),
        status: 'draft' // Or whatever status is appropriate
      })
      .eq('id', projectId)
      .select()
      .single();

    if (projectError) throw projectError;

    // 4. Update/Insert individual CRFs
    // Note: In a flattened structure, CRFs are direct children of the Project.
    for (const form of pkg.forms) {
      const { error: crfError } = await supabase
        .from('crfs')
        .upsert({
          // We use a composite key of (project_id, table_name) for upsert if possible,
          // but the table PK is UUID. The UI generates random UUIDs for new forms.
          // If we want to update existing CRFs, we need to match IDs or delete-insert.
          // For now, using the ID from the designer (which is consistent for updates).
          id: form.id,
          project_id: projectId,
          table_name: form.tablename,
          display_name: form.displayname,
          display_order: form.displayOrder,
          parent_table: form.parenttable,
          linking_field: form.linkingfield,
          id_config: form.id_config,
          display_fields: form.displayFields,
          fields: form.questions, // JSONB column
          auto_start_repeat: form.autoStartRepeat,
          repeat_enforce_count: form.repeatEnforceCount,
        });

      if (crfError) throw crfError;
    }

    return projectData;
  },

  /**
   * Loads the survey protocol for a specific Project.
   */
  async getSurveyPackage(projectId: string): Promise<SurveyPackage> {
    // 1. Fetch the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;

    // 2. Fetch the CRFs associated with this project
    const { data: crfs, error: crfsError } = await supabase
      .from('crfs')
      .select('*')
      .eq('project_id', projectId)
      .order('display_order');

    if (crfsError) throw crfsError;

    // 3. Construct the Protocol object (SurveyPackage)
    return {
      id: project.id,
      name: project.name,
      version: project.version || '1.0',
      forms: crfs.map(crf => ({
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
      }))
    };
  }
};