import {
  LineChart,
  Pencil,
  BarChart2,
  Type,
  Crosshair,
  Share2,
  Circle,
  Maximize,
  Home,
  PenTool,
  Eye,
  Trash2,
} from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-14 bg-[#121212] border-r border-[#2a2a2a] flex flex-col">
      <div className="flex-1 flex flex-col">
        <button className="p-3 text-[#999] hover:text-white">
          <div className="flex justify-center">1m</div>
        </button>

        <button className="p-3 text-[#999] hover:text-white">
          <div className="flex justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 12H8M16 12H18M12 6V8M12 16V18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </button>

        <button className="p-3 text-[#999] hover:text-white">
          <div className="flex justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 12H5M19 12H22M12 2V5M12 19V22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle
                cx="12"
                cy="12"
                r="7"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
        </button>

        <button className="p-3 text-[#999] hover:text-white">
          <div className="flex justify-center">Indicadores</div>
        </button>

        <div className="border-t border-[#2a2a2a] my-2"></div>

        <button className="p-3 text-[#999] hover:text-white">
          <LineChart size={18} />
        </button>

        <button className="p-3 text-[#999] hover:text-white">
          <Pencil size={18} />
        </button>

        <button className="p-3 text-[#999] hover:text-white">
          <BarChart2 size={18} />
        </button>

        <button className="p-3 text-[#999] hover:text-white">
          <Type size={18} />
        </button>

        <button className="p-3 text-[#999] hover:text-white">
          <Crosshair size={18} />
        </button>

        <button className="p-3 text-[#999] hover:text-white">
          <Share2 size={18} />
        </button>

        <button className="p-3 text-[#999] hover:text-white">
          <Circle size={18} />
        </button>

        <button className="p-3 text-[#999] hover:text-white">
          <Maximize size={18} />
        </button>

        <button className="p-3 text-[#999] hover:text-white">
          <Home size={18} />
        </button>

        <button className="p-3 text-[#999] hover:text-white">
          <PenTool size={18} />
        </button>

        <button className="p-3 text-[#999] hover:text-white">
          <Eye size={18} />
        </button>
      </div>

      <div className="mt-auto">
        <button className="p-3 text-[#999] hover:text-white">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
