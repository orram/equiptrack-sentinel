import React, { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, AlertCircle, Download } from "lucide-react";

export default function FileUploadZone({ onFileUpload }) {
  const [dragActive, setDragActive] = React.useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(file => 
      file.type.includes("spreadsheet") || 
      file.type.includes("excel") || 
      file.name.endsWith(".csv") ||
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls") ||
      file.type === "text/csv" ||
      file.type === "application/vnd.ms-excel" ||
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    
    if (validFile) {
      onFileUpload(validFile);
    }
  }, [onFileUpload]);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const downloadExample = () => {
    const csvContent = `Serial-Number,Object-Name,Platoon,Name,ID,Status,Squad,Signature
M4A1-001234,M4A1 Carbine,Alpha,John Smith,12345,assigned,1st Squad,J.Smith
NVG-567890,Night Vision Goggles,Alpha,Jane Doe,54321,assigned,2nd Squad,J.Doe
RADIO-111222,PRC-152 Radio,Bravo,Mike Johnson,98765,storage,,
VEST-333444,Body Armor Vest,Alpha,Sarah Wilson,11111,assigned,1st Squad,S.Wilson
HELMET-555666,Combat Helmet,Charlie,Tom Brown,22222,repair,,
BIPOD-777888,M4 Bipod,Bravo,Lisa Davis,33333,assigned,3rd Squad,L.Davis`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'equipment-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-2 border-dashed border-slate-300 hover:border-slate-400 transition-colors">
      <CardContent className="p-12">
        <div
          className={`text-center ${dragActive ? "bg-slate-50" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <FileSpreadsheet className="w-8 h-8 text-slate-600" />
          </div>
          
          <h3 className="text-xl font-semibold mb-2">Upload Equipment Data</h3>
          <p className="text-slate-500 mb-6">
            Drag & drop your Excel or CSV file here, or click to browse
          </p>
          
          <input
            type="file"
            accept=".xlsx,.xls,.csv,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          
          <div className="flex gap-3 justify-center mb-6">
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </label>
            </Button>
            
            <Button variant="outline" onClick={downloadExample}>
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>
          
          <div className="text-sm text-slate-500 space-y-4">
            <p className="flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Supported formats: .xlsx, .xls, .csv
            </p>
            
            <div className="bg-slate-50 p-4 rounded-lg text-left">
              <p className="font-medium mb-2">Required column headers (in any order):</p>
              <ul className="text-xs space-y-1 mb-4">
                <li>• <strong>Serial-Number</strong> - Unique equipment identifier</li>
                <li>• <strong>Object-Name</strong> - Equipment name/description</li>
                <li>• <strong>Platoon</strong> - Platoon assignment</li>
                <li>• <strong>Name</strong> - Soldier's full name</li>
                <li>• <strong>ID</strong> - Soldier ID number</li>
                <li>• <strong>Status</strong> - assigned, storage, or repair</li>
                <li>• <strong>Squad</strong> - Squad assignment (optional)</li>
                <li>• <strong>Signature</strong> - Digital signature (optional)</li>
              </ul>
              
              <div className="bg-white p-3 rounded border text-xs font-mono">
                <div className="font-bold mb-1">Example CSV format:</div>
                <div className="text-slate-600">
                  Serial-Number,Object-Name,Platoon,Name,ID,Status,Squad,Signature<br/>
                  M4A1-001234,M4A1 Carbine,Alpha,John Smith,12345,assigned,1st Squad,J.Smith<br/>
                  NVG-567890,Night Vision Goggles,Alpha,Jane Doe,54321,assigned,2nd Squad,J.Doe
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}