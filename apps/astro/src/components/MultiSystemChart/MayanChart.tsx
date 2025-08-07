import React from 'react';
import { MayanChartData } from './types';

interface Props {
  data: MayanChartData;
}

const MayanChart: React.FC<Props> = ({ data }) => {
  if (!data) return <p className="text-cosmic-silver">No Mayan astrology data available</p>;

  return (
    <div className="flex flex-col space-y-4">
      <div className="cosmic-card bg-green-50/95">
        <div className="p-4 text-gray-800">
          <h3 className="mb-4 font-bold text-green-700 text-md">Mayan Astrology</h3>
          <p className="mb-4 text-sm font-medium text-gray-700">
            {data.description}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="mb-2 font-bold">Tzolk'in Signature</p>
              <p className="mb-2 text-2xl">{data.sacred_number?.number} {data.day_sign?.name}</p>
              <p className="mb-2 text-sm"><strong>Symbol:</strong> {data.day_sign?.symbol}</p>
              <p className="mb-2 text-sm"><strong>Color:</strong> {data.day_sign?.color}</p>
              <p className="mb-2 text-sm"><strong>Meaning:</strong> {data.day_sign?.meaning}</p>
            </div>
            <div>
              <p className="mb-2 font-bold">Wavespell</p>
              <p className="mb-2 text-sm"><strong>Tone:</strong> {data.wavespell?.tone?.name} ({data.wavespell?.position})</p>
              <p className="mb-4 text-sm">{data.wavespell?.description}</p>
              <p className="mb-2 font-bold">Long Count</p>
              <p className="font-mono text-sm">{data.long_count?.date}</p>
            </div>
          </div>

          <p className="mb-2 font-bold">Galactic Signature</p>
          <p className="mb-4 text-sm">{data.galactic_signature}</p>

          <p className="mb-2 font-bold">Life Purpose</p>
          <p className="mb-4 text-sm">{data.life_purpose}</p>

          <p className="mb-2 font-bold">Spiritual Guidance</p>
          <p className="text-sm">{data.spiritual_guidance}</p>
        </div>
      </div>
    </div>
  );
};

export default MayanChart;