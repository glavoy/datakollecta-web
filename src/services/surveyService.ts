import { supabase } from "@/lib/supabase";
import { SurveyPackage } from "@/types/survey";
import { generateManifestGistx, generateFormXml } from "@/lib/xmlGenerator";
import JSZip from "jszip";

export const surveyService = {
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
    
    // 2. Upload Zip to Storage
    const date = new Date().toISOString().split('T')[0];
    const sanitizedName = pkg.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = `${projectId}/${sanitizedName}_${date}_${Date.now()}.zip`;
    
    const { error: uploadError } = await supabase.storage
      .from('survey-packages')
      .upload(filePath, zipBlob);

    if (uploadError) throw uploadError;

    // 3. Update/Insert survey_packages table
    const { data: packageData, error: packageError } = await supabase
      .from('survey_packages')
      .upsert({
        id: pkg.id,
        project_id: projectId,
        name: pkg.name,
        version: pkg.version,
        manifest: JSON.parse(manifestJson),
        zip_file_path: filePath,
        created_by: userId,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (packageError) throw packageError;

    // 4. Update/Insert individual CRFs
    for (const form of pkg.forms) {
      const { error: crfError } = await supabase
        .from('crfs')
        .upsert({
          id: form.id,
          survey_package_id: packageData.id,
          project_id: projectId,
          table_name: form.tablename,
          display_name: form.displayname,
          display_order: form.displayOrder,
          parent_table: form.parenttable,
          linking_field: form.linkingfield,
          id_config: form.idconfig,
          display_fields: form.displayFields,
          fields: form.questions, // This stores the question structure for editing
        });

      if (crfError) throw crfError;
    }

    return packageData;
  },

  async getSurveyPackage(surveyId: string): Promise<SurveyPackage> {
    // 1. Fetch the package
    const { data: pkg, error: pkgError } = await supabase
      .from('survey_packages')
      .select('*')
      .eq('id', surveyId)
      .single();

    if (pkgError) throw pkgError;

    // 2. Fetch the CRFs
    const { data: crfs, error: crfsError } = await supabase
      .from('crfs')
      .select('*')
      .eq('survey_package_id', surveyId)
      .order('display_order');

    if (crfsError) throw crfsError;

    // 3. Map back to SurveyPackage type
    return {
      id: pkg.id,
      name: pkg.name,
      version: pkg.version || '1.0',
      forms: crfs.map(crf => ({
        id: crf.id,
        tablename: crf.table_name,
        displayname: crf.display_name,
        displayOrder: crf.display_order,
        parenttable: crf.parent_table,
        linkingfield: crf.linking_field,
        displayFields: crf.display_fields,
        idconfig: crf.id_config,
        questions: crf.fields || [], // The questions are stored in the fields JSONB column
        autoStartRepeat: crf.auto_start_repeat || 0,
        repeatEnforceCount: crf.repeat_enforce_count || 1,
      }))
    };
  }
};
