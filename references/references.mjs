export const references={
  "BS-001": {
    "name": "Intel Core Ultra 9 285K",
    "scope": "Intel official product-family documentation",
    "docs": [
      [
        "Datasheet volume 1 · PDF",
        "https://cdrdv2-public.intel.com/832586/832586_006.pdf",
        "Rev 006 · mechanical, electrical and platform data"
      ],
      [
        "Current package mechanical specifications",
        "https://edc.intel.com/content/www/us/en/design/products/platforms/details/arrow-lake-s/core-ultra-200s-series-processors-datasheet-volume-1-of-2/package-mechanical-specifications/",
        "Current online revision"
      ],
      [
        "Specification update · PDF",
        "https://edc.intel.com/output/DownloadPdfDocument?id=8247",
        "Errata and specification updates"
      ]
    ],
    "geometry": "45 × 37.5 mm nominal substrate; 1851 lands. Existing outline is approximate; tile placement schematic.",
    "archive": "/v4/companions/bs-001-rev-b.pdf"
  },
  "BS-002": {
    "name": "Noble DDR5 64 GB",
    "scope": "Concept product — official Kingston FURY reference, not a Noble manufacturer specification",
    "docs": [
      [
        "Kingston KF564C32BBAK2-64 · PDF",
        "https://www.kingston.com/datasheets/KF564C32BBAK2-64.pdf",
        "2 × 32 GB DDR5-6400, CL32, 288 contacts, dimensioned module drawing"
      ],
      [
        "Kingston reference part",
        "https://www.kingston.com/unitedkingdom/en/memory/search/discontinuedmodels?partId=KF564C32BBAK2-64",
        "Reference kit product record"
      ]
    ],
    "geometry": "Reference module 133.35 × 42.23 × 7.11 mm; 144 contacts per face, 16 DRAM packages per module. Noble finish and layout are conceptual.",
    "archive": "/v5/companions/bs-002.pdf"
  },
  "BS-003": {
    "name": "GeForce RTX 5090",
    "scope": "NVIDIA official Founders Edition and architecture documentation",
    "docs": [
      [
        "RTX Blackwell architecture · PDF",
        "https://images.nvidia.com/aem-dam/Solutions/geforce/blackwell/nvidia-rtx-blackwell-gpu-architecture.pdf",
        "57 pages · GB202, SM, memory, Tensor and RT architecture"
      ],
      [
        "RTX 5090 Quick Start Guide · PDF",
        "https://www.nvidia.com/content/geforce-gtx/geforce-rtx-5090-user-guide-r2.pdf",
        "157 pages · multilingual, accessory set and installation"
      ],
      [
        "Official product specifications",
        "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/",
        "304 × 137 mm face, two-slot body; 61 mm recommended clearance"
      ]
    ],
    "geometry": "304 × 137 mm face, dual flow-through cooler; central electronics and split I/O schematic, not measured CAD. Classic retail packaging is custom.",
    "archive": "/gpu/dossier-rev-b.pdf"
  },
  "BS-004": {
    "name": "Vera Rubin · logic wafer",
    "scope": "NVIDIA published Rubin GPU architecture plus a representative 300 mm wafer carrier. Not an official wafer product or manufacturing model.",
    "docs": [
      [
        "Rubin GPU architecture",
        "https://developer.nvidia.com/blog/inside-nvidia-rubin-gpu-architecture-powering-the-era-of-agentic-ai/",
        "Dual logic dies, published peak resources and HBM4"
      ],
      [
        "Vera Rubin platform",
        "https://developer.nvidia.com/blog/inside-the-NVIDIA-rubin-platform-six-new-chips-one-ai-supercomputer/",
        "Vera CPU and Rubin GPU are distinct chips"
      ],
      [
        "HGX reference specifications",
        "https://www.nvidia.com/en-us/data-center/hgx/",
        "Individual GPU peak specifications; system ratings may differ"
      ],
      [
        "B200 reference baseline",
        "https://docs.nvidia.com/enterprise-reference-architectures/hgx-ai-factory-h100-h200-b200/latest/components.html",
        "180 GB HBM3e per B200"
      ],
      [
        "H300 wafer shipper datasheet · PDF",
        "https://www.entegris.com/content/dam/product-assets/h300series300mmsinglewafershippers/datasheet-h300-sws-5658.pdf",
        "300 mm single-wafer handling reference"
      ]
    ],
    "geometry": "300 mm diameter; patterned die map, yield, carrier and fabrication are schematic. Package contains two logic dies and eight illustrative HBM stacks. No proprietary floorplan or actual wafer offer.",
    "archive": null
  }
};
