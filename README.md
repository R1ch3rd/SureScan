# SureScan

Brain tumor detection and diagnosis assistant. Three models behind one workflow:
YOLOv11 localization, EfficientNet-B3 classification across 44 tumor classes,
XGBoost survival-time prediction, and Gemini-powered Q&A over uploaded reports.

**Live demo:** https://surescan-tawny.vercel.app
**API:** https://r1ch3rd-surescan-api.hf.space

> Research and portfolio demonstration, not a medical device. Nothing here is
> medical advice.

## Features

| Feature | How it works |
|---|---|
| **Tumor detection** | Fine-tuned YOLOv11 draws bounding boxes on suspect regions |
| **Classification** | EfficientNet-B3 assigns one of 44 tumor classes with top-5 confidences |
| **Survival prediction** | XGBoost estimates survival time from tumor type, grade, location, treatment, and outcome |
| **Report Q&A** | Upload a medical report PDF and ask questions; retrieval-augmented answers via Gemini |

## Architecture

- **Frontend** — React + Vite + Tailwind, deployed on Vercel
- **Backend** — FastAPI on a Hugging Face Space (Docker, CPU). Weights (YOLOv11,
  EfficientNet, XGBoost + encoders/scaler) ship in the image; the Gemini key is
  a Space secret.

## Run locally

```bash
# backend
pip install -r requirements-space.txt
API_KEY=<your-gemini-key> uvicorn api:app --reload --port 8000

# frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
```

## Notes

- The demo backend sleeps after ~48h idle on the free tier; the first request
  after a quiet spell takes ~30s to wake.
- Built with a team during a hackathon.
