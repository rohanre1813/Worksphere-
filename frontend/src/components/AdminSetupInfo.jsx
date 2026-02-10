import { Download, Printer, Info } from "lucide-react";

export default function AdminSetupInfo() {
  const zones = [
    { name: "In", description: "Entry Point - Employees scan to start the day" },
    { name: "Out", description: "Exit Point - Employees scan to end the day" },
    { name: "Work Zone", description: "Main Office Area" },
    { name: "Meeting Zone", description: "Conference Rooms" },
    { name: "Cafeteria Zone", description: "Lunch & Break Area" },
    { name: "Recreation Zone", description: "Gaming & Chill Area" },
    { name: "Restricted Zone", description: "Server Room / Private Area" },
  ];

  /* 
    🔥 Download Helper 
    Actually fetches the image blob so it works cross-origin properly 
    without redirecting the user.
  */
  const downloadQR = async (zoneName) => {
    try {
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${zoneName}&format=png`;
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${zoneName.replace(/\s+/g, "_")}_QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed", error);
      alert("Failed to download QR code.");
    }
  };

  return (
    <div className="min-h-screen p-3 sm:p-6 text-black">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="bg-white/40 backdrop-blur-lg border border-white/30 rounded-2xl shadow-xl p-6 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
              <Printer className="text-blue-600" /> Setup Guide & QR Codes
            </h1>
            <p className="text-black max-w-2xl">
              Use this page to generate and print QR codes for your office doors.
              Attach each QR code to the entrance of the respective zone.
            </p>

            <div className="mt-6 bg-black-50/80 backdrop-blur-sm   p-4 rounded-lg">
              <h3 className="font-semibold flex items-center gap-2 text-black mb-2">
                <Info size={18} /> Implementation Steps:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-800 ml-1">
                <li>Print the <strong>"In"</strong> QR code and place it at the Main Entrance.</li>
                <li>Print the <strong>"Out"</strong> QR code and place it at the building Exit.</li>
                <li>Employees <strong>MUST</strong> scan "In" first to activate their session.</li>
                <li>Download and print specific zone QRs (Meeting, Cafeteria, etc.) for internal doors.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* QR GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {zones.map((zone) => (
            <div key={zone.name} className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 flex flex-col items-center text-center border border-white/50 group">

              <div className="w-full aspect-square bg-white rounded-xl p-4 mb-4 flex items-center justify-center border border-gray-100 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${zone.name}`}
                  alt={`${zone.name} QR Code`}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>

              <h2 className="text-lg font-bold text-gray-900 mb-1">{zone.name}</h2>
              <p className="text-xs text-gray-900 mb-4 h-8 flex items-center justify-center line-clamp-2">
                {zone.description}
              </p>

              <button
                onClick={() => downloadQR(zone.name)}
                className="mt-auto flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 rounded-xl transition-colors text-sm font-medium w-full"
              >
                <Download size={16} /> Download
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
