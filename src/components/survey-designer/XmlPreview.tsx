import { SurveyForm, SurveyPackage } from "@/types/survey";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateFormXml, generateManifestGistx, downloadFile, downloadSurveyZip } from "@/lib/xmlGenerator";
import { Copy, Download, FileArchive } from "lucide-react";
import { toast } from "sonner";

interface XmlPreviewProps {
  surveyPackage: SurveyPackage;
  currentForm: SurveyForm | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const XmlPreview = ({ surveyPackage, currentForm, open, onOpenChange }: XmlPreviewProps) => {
  const formXml = currentForm ? generateFormXml(currentForm) : '';
  const manifestJson = generateManifestGistx(surveyPackage);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  const handleDownloadXml = () => {
    if (currentForm) {
      downloadFile(formXml, `${currentForm.tablename}.xml`, 'text/xml');
      toast.success('XML file downloaded');
    }
  };

  const handleDownloadManifest = () => {
    downloadFile(manifestJson, 'survey_manifest.gistx', 'application/json');
    toast.success('Manifest file downloaded');
  };

  const handleDownloadZip = async () => {
    try {
      await downloadSurveyZip(surveyPackage);
      toast.success('Survey package downloaded');
    } catch (error) {
      console.error('Failed to generate zip:', error);
      toast.error('Failed to generate zip file');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Preview & Export</DialogTitle>
          <DialogDescription>
            Review the generated XML and manifest files before exporting
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="xml" className="flex-1 overflow-hidden flex flex-col">
          <TabsList>
            <TabsTrigger value="xml">Form XML</TabsTrigger>
            <TabsTrigger value="manifest">Manifest (GISTX)</TabsTrigger>
          </TabsList>

          <TabsContent value="xml" className="flex-1 overflow-hidden mt-4">
            {currentForm ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{currentForm.tablename}.xml</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(formXml, 'XML')}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadXml}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <ScrollArea className="flex-1 border border-border rounded-lg bg-muted/30">
                  <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
                    {formXml}
                  </pre>
                </ScrollArea>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Select a form to preview its XML
              </p>
            )}
          </TabsContent>

          <TabsContent value="manifest" className="flex-1 overflow-hidden mt-4">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">survey_manifest.gistx</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(manifestJson, 'Manifest')}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadManifest}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
              <ScrollArea className="flex-1 border border-border rounded-lg bg-muted/30">
                <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
                  {manifestJson}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleDownloadZip}>
            <FileArchive className="h-4 w-4 mr-2" />
            Download Zip Package
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default XmlPreview;
