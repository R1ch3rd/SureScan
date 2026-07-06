import React, { useState, useEffect, useRef } from "react";
import { API_BASE } from '../lib/api';
import {
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  Activity,
  Thermometer,
  Target,
} from "lucide-react";

const DiagnosisPage = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [diagnosisConfidence, setDiagnosisConfidence] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detailedResults, setDetailedResults] = useState(null);
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [tumorDetections, setTumorDetections] = useState([]);
  const [originalImageDimensions, setOriginalImageDimensions] = useState(null);
  const [imageScale, setImageScale] = useState(1);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const imageContainerRef = useRef(null);
  const originalImageRef = useRef(null);
  const boundingBoxContainerRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    // Reset states
    setFile(file);
    setDiagnosisResult(null);
    setDiagnosisConfidence(null);
    setError(null);
    setShowDetailedReport(false);
    setDetailedResults(null);
    setTumorDetections([]);
    setOriginalImageDimensions(null);
    setShowBoundingBoxes(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload the image for classification
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE}/classification`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      // Update the state with the classification results based on new API response structure
      setDiagnosisResult(data.classification.class_name);
      setDiagnosisConfidence(Math.round(data.classification.confidence * 100));
      setDetailedResults(data);
      setTumorDetections(data.tumor_detection.bounding_boxes);
      setOriginalImageDimensions(data.image_dimensions);
    } catch (error) {
      console.error("Error classifying image:", error);
      setError("Failed to classify the image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setPreviewUrl(null);
    setDiagnosisResult(null);
    setDiagnosisConfidence(null);
    setError(null);
    setShowDetailedReport(false);
    setDetailedResults(null);
    setTumorDetections([]);
    setOriginalImageDimensions(null);
  };

  const generateDetailedReport = () => {
    setShowDetailedReport(true);
  };

  const toggleBoundingBoxes = () => {
    setShowBoundingBoxes(!showBoundingBoxes);
  };

  const getRiskLevelColor = (className) => {
    // Simplified risk assessment based on tumor types
    if (className.includes("NORMAL")) {
      return "text-sage";
    } else if (
      className.includes("Glioblastoma") ||
      className.includes("Meduloblastoma")
    ) {
      return "text-blush";
    } else {
      return "text-butter";
    }
  };

  const getRiskLevel = (className) => {
    if (className.includes("NORMAL")) {
      return "low";
    } else if (
      className.includes("Glioblastoma") ||
      className.includes("Meduloblastoma")
    ) {
      return "high";
    } else {
      return "moderate";
    }
  };

  // Extract the base tumor type from the class name
  const getTumorType = (className) => {
    if (className.includes("NORMAL")) {
      return "No tumor detected";
    }

    // Extract the tumor type by removing the MRI type (T1, T1C+, T2)
    const parts = className.split(" ");
    return parts[0];
  };

  // Calculate image scale factor when image or container changes
  useEffect(() => {
    if (imageContainerRef.current && previewUrl && originalImageDimensions) {
      const updateScale = () => {
        const containerWidth = imageContainerRef.current.clientWidth;
        const containerHeight = imageContainerRef.current.clientHeight;
        const { width, height } = originalImageDimensions;

        // Calculate scale to fit image in container while maintaining aspect ratio
        const widthScale = containerWidth / width;
        const heightScale = containerHeight / height;
        const scale = Math.min(widthScale, heightScale);

        setImageScale(scale);
      };

      // Initial calculation
      updateScale();

      // Update on window resize
      window.addEventListener("resize", updateScale);
      return () => window.removeEventListener("resize", updateScale);
    }
  }, [previewUrl, originalImageDimensions]);

  // Original image without bounding boxes
  const OriginalImage = () => {
    if (!previewUrl) return null;

    return (
      <div
        ref={originalImageRef}
        className="relative h-full w-full overflow-hidden"
      >
        <img
          src={previewUrl}
          alt="MRI Original"
          className="w-full h-full object-contain bg-cream"
        />
      </div>
    );
  };

  // Image with bounding boxes overlay
  const BoundingBoxesOverlay = () => {
    if (!previewUrl || !tumorDetections || tumorDetections.length === 0)
      return null;

    return (
      <div
        ref={boundingBoxContainerRef}
        className="relative h-full w-full overflow-hidden"
      >
        <img
          src={previewUrl}
          alt="MRI With Detections"
          className="w-full h-full object-contain bg-cream"
        />

        {showBoundingBoxes &&
          tumorDetections.map((box, index) => {
            const { x1, y1, x2, y2, confidence } = box.pixels;
            const boxWidth = x2 - x1;
            const boxHeight = y2 - y1;

            return (
              <div
                key={index}
                className="absolute border-2 border-red-500 pointer-events-none"
                style={{
                  left: `${x1 * imageScale}px`,
                  top: `${y1 * imageScale}px`,
                  width: `${boxWidth * imageScale}px`,
                  height: `${boxHeight * imageScale}px`,
                }}
              >
                <div className="absolute -top-6 left-0 bg-red-500 text-ink px-2 py-1 text-xs rounded whitespace-nowrap">
                  Tumor {index + 1} ({Math.round(confidence * 100)}%)
                </div>
              </div>
            );
          })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 text-ink">
          Brain Tumor Diagnosis
        </h1>
        <p className="text-ink-muted max-w-3xl mx-auto">
          Upload an MRI scan image to detect and classify potential brain tumors
          using our advanced AI technology
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-surface p-8 rounded-2xl border border-surface-border">
          <h2 className="text-2xl font-semibold mb-6">Upload MRI Scan</h2>

          {!file ? (
            <div
              className={`border-2 border-dashed rounded-xl h-80 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                dragActive
                  ? "border-accent bg-accent/10"
                  : "border-surface-border hover:border-accent"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <Upload size={48} className="text-ink-muted mb-4" />
              <p className="text-center text-ink-muted mb-2">
                Drag and drop your MRI scan here
              </p>
              <p className="text-center text-ink-faint text-sm mb-4">
                or click to browse files
              </p>
              <p className="text-center text-ink-faint text-xs">
                Supported formats: JPG, PNG, DICOM
              </p>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative h-80 rounded-xl overflow-hidden">
              <div ref={imageContainerRef} className="h-full w-full">
                <OriginalImage />
              </div>
              <button
                onClick={resetUpload}
                className="absolute top-2 right-2 p-2 bg-cream/70 rounded-full hover:bg-cream"
              >
                <X size={20} />
              </button>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">
              Guidelines for best results:
            </h3>
            <ul className="text-ink-muted space-y-2">
              <li className="flex items-start">
                <Info size={16} className="mr-2 mt-1 text-accent-deep" />
                <span>
                  Use high-resolution MRI scans for more accurate diagnosis
                </span>
              </li>
              <li className="flex items-start">
                <Info size={16} className="mr-2 mt-1 text-accent-deep" />
                <span>Ensure the scan clearly shows the brain structure</span>
              </li>
              <li className="flex items-start">
                <Info size={16} className="mr-2 mt-1 text-accent-deep" />
                <span>
                  T1-weighted and T2-weighted MRI scans are both supported
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-surface p-8 rounded-2xl border border-surface-border">
          <h2 className="text-2xl font-semibold mb-6">Diagnosis Results</h2>

          {isLoading ? (
            <div className="h-80 flex flex-col items-center justify-center border border-surface-border rounded-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
              <p className="text-ink-muted text-center">
                Analyzing your MRI scan...
              </p>
            </div>
          ) : error ? (
            <div className="h-80 flex flex-col items-center justify-center border border-surface-border rounded-xl">
              <AlertCircle size={48} className="text-blush mb-4" />
              <p className="text-ink-muted text-center">{error}</p>
            </div>
          ) : !diagnosisResult ? (
            <div className="h-80 flex flex-col items-center justify-center border border-surface-border rounded-xl">
              <AlertCircle size={48} className="text-ink-faint mb-4" />
              <p className="text-ink-muted text-center">
                {file
                  ? "Waiting to analyze..."
                  : "Upload an MRI scan to see diagnosis results"}
              </p>
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center border border-surface-border rounded-xl p-6 overflow-y-auto">
              {diagnosisResult.includes("_NORMAL") ? (
                <CheckCircle size={64} className="text-sage mb-6" />
              ) : (
                <AlertCircle size={64} className="text-amber-500 mb-6" />
              )}

              <h3 className="text-2xl font-bold mb-2">
                {getTumorType(diagnosisResult)}
              </h3>
              <p className="text-sm text-ink-muted mb-4">{diagnosisResult}</p>

              <div className="w-full max-w-xs bg-cream-deep rounded-full h-4 mb-4">
                <div
                  className={`h-4 rounded-full ${
                    diagnosisResult.includes("_NORMAL")
                      ? "bg-green-500"
                      : "bg-amber-500"
                  }`}
                  style={{ width: `${diagnosisConfidence}%` }}
                ></div>
              </div>

              <p className="text-ink-muted text-center mb-4">
                Confidence:{" "}
                <span className="font-semibold">{diagnosisConfidence}%</span>
              </p>

              {/* Tumor detections summary */}
              {tumorDetections.length > 0 && (
                <div className="w-full max-w-xs mb-4">
                  <h4 className="font-semibold text-center mb-2">
                    Detected Tumors
                  </h4>
                  <div className="bg-cream-deep/70 p-3 rounded-lg text-center">
                    <div className="flex items-center justify-center">
                      <Target className="text-blush mr-2" size={16} />
                      <p className="font-bold text-lg">
                        {tumorDetections.length}
                        {tumorDetections.length === 1
                          ? " region"
                          : " regions"}{" "}
                        detected
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk Level */}
              <div className="w-full max-w-xs mb-4">
                <h4 className="font-semibold text-center mb-2">Risk Level</h4>
                <div className="bg-cream-deep/70 p-3 rounded-lg text-center">
                  <p
                    className={`font-bold text-lg ${getRiskLevelColor(
                      diagnosisResult
                    )}`}
                  >
                    {getRiskLevel(diagnosisResult).charAt(0).toUpperCase() +
                      getRiskLevel(diagnosisResult).slice(1)}
                  </p>
                </div>
              </div>

              <p className="text-ink-faint text-xs text-center">
                This prediction is based on AI analysis. Always consult with a
                medical professional for actual diagnosis.
              </p>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">What happens next?</h3>
            <p className="text-ink-muted mb-4">
              Our AI provides an initial assessment, but it's important to
              follow up with a healthcare professional for a complete diagnosis.
            </p>
            <button
              onClick={generateDetailedReport}
              className="w-full py-3 bg-accent-btn rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              disabled={!diagnosisResult}
            >
              Generate Detailed Report
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Report Section - Modified to always include Tumor Detection Visualization */}
      {showDetailedReport && diagnosisResult && detailedResults && (
        <div className="mt-12 bg-surface p-8 rounded-2xl border border-surface-border animate-fade-in">
          <h2 className="text-3xl font-bold mb-6 text-ink">
            Detailed Diagnosis Report
          </h2>

          {/* Tumor Detection Visualization - Now part of the detailed report */}
          {previewUrl && (
            <div className="mb-8 bg-cream-deep/30 p-6 rounded-xl border border-surface-border/50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold flex items-center">
                  <Target size={20} className="mr-2 text-blush" />
                  MRI Scan Analysis
                </h3>
                {tumorDetections.length > 0 && (
                  <button
                    onClick={toggleBoundingBoxes}
                    className="px-4 py-2 bg-accent-btn hover:bg-accent-btn rounded-lg text-sm font-medium transition-colors"
                  >
                    {showBoundingBoxes ? "Hide Regions" : "Show Regions"}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Original MRI Image */}
                <div className="bg-cream-deep/30 rounded-xl p-4 border border-surface-border/50">
                  <h4 className="text-lg font-medium mb-3">
                    Original MRI Scan
                  </h4>
                  <div className="h-64 overflow-hidden rounded-lg bg-cream">
                    <OriginalImage />
                  </div>
                </div>

                {/* Tumor Detection Image */}
                <div className="bg-cream-deep/30 rounded-xl p-4 border border-surface-border/50">
                  <h4 className="text-lg font-medium mb-3">
                    {tumorDetections.length > 0
                      ? "Tumor Detection"
                      : "Analysis Result"}
                  </h4>
                  <div className="h-64 overflow-hidden rounded-lg bg-cream">
                    {tumorDetections.length > 0 ? (
                      <BoundingBoxesOverlay />
                    ) : (
                      <OriginalImage />
                    )}
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Detection Summary:</h4>
                    <div className="bg-cream-deep/70 p-3 rounded-lg">
                      {tumorDetections.length > 0 ? (
                        <>
                          <p className="text-sm">
                            <span className="font-medium">
                              Total regions detected:
                            </span>{" "}
                            {tumorDetections.length}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">
                              Highest confidence:
                            </span>{" "}
                            {Math.round(
                              Math.max(
                                ...tumorDetections.map(
                                  (d) => d.pixels.confidence
                                )
                              ) * 100
                            )}
                            %
                          </p>
                        </>
                      ) : (
                        <p className="text-sm">
                          <span className="font-medium">Analysis result:</span>{" "}
                          {diagnosisResult.includes("_NORMAL")
                            ? "No abnormalities detected"
                            : "Potential abnormalities detected"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detailed tumor detection information */}
          {tumorDetections.length > 0 && (
            <div className="mb-8 p-6 bg-cream-deep/30 rounded-xl border border-surface-border/50">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Target size={20} className="mr-2 text-blush" />
                Tumor Analysis
              </h3>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Detection Details:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tumorDetections.map((detection, index) => (
                      <div
                        key={index}
                        className="bg-cream-deep/70 p-3 rounded-lg"
                      >
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Tumor {index + 1}</span>
                          <span className="text-blush font-medium">
                            {Math.round(detection.pixels.confidence * 100)}%
                            confidence
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-ink-muted">
                          <span>
                            Size:{" "}
                            {Math.round(
                              (detection.pixels.x2 - detection.pixels.x1) *
                                (detection.pixels.y2 - detection.pixels.y1)
                            )}{" "}
                            px²
                          </span>
                          <span>Position: center</span>
                          <span>
                            Width:{" "}
                            {Math.round(
                              detection.pixels.x2 - detection.pixels.x1
                            )}{" "}
                            px
                          </span>
                          <span>
                            Height:{" "}
                            {Math.round(
                              detection.pixels.y2 - detection.pixels.y1
                            )}{" "}
                            px
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Classification Details */}
            <div className="bg-cream-deep/30 p-6 rounded-xl border border-surface-border/50">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <AlertCircle size={20} className="mr-2 text-accent-deep" />
                Classification
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-ink-muted text-sm mb-1">Tumor Type</p>
                  <p className="font-semibold text-lg">
                    {getTumorType(diagnosisResult)}
                  </p>
                </div>

                <div>
                  <p className="text-ink-muted text-sm mb-1">
                    MRI Sequence Type
                  </p>
                  <p>
                    {diagnosisResult.includes("T1C+")
                      ? "T1 with Contrast"
                      : diagnosisResult.includes("T1")
                      ? "T1-weighted"
                      : "T2-weighted"}
                  </p>
                </div>

                <div>
                  <p className="text-ink-muted text-sm mb-1">Risk Level</p>
                  <p
                    className={`font-semibold ${getRiskLevelColor(
                      diagnosisResult
                    )}`}
                  >
                    {getRiskLevel(diagnosisResult).charAt(0).toUpperCase() +
                      getRiskLevel(diagnosisResult).slice(1)}
                  </p>
                </div>

                {tumorDetections.length > 0 && (
                  <div>
                    <p className="text-ink-muted text-sm mb-1">Detections</p>
                    <p className="font-semibold">
                      {tumorDetections.length} tumor{" "}
                      {tumorDetections.length === 1 ? "region" : "regions"}{" "}
                      detected
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Predictions */}
            <div className="bg-cream-deep/30 p-6 rounded-xl border border-surface-border/50">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Activity size={20} className="mr-2 text-accent-deep" />
                Alternative Diagnoses
              </h3>

              <div className="space-y-3">
                {detailedResults.classification.top_predictions &&
                  detailedResults.classification.top_predictions
                    .slice(1, 5)
                    .map((prediction, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span>{getTumorType(prediction.class_name)}</span>
                        <div className="flex items-center">
                          <div className="w-24 bg-cream-deep rounded-full h-2 mr-2">
                            <div
                              className="bg-accent h-2 rounded-full"
                              style={{
                                width: `${prediction.confidence * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-ink-muted">
                            {Math.round(prediction.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
              </div>
            </div>

            {/* Recommended Actions */}
            <div className="bg-cream-deep/30 p-6 rounded-xl border border-surface-border/50">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Clock size={20} className="mr-2 text-accent-deep" />
                Recommended Actions
              </h3>

              {diagnosisResult.includes("_NORMAL") ? (
                <div className="flex flex-col items-center justify-center">
                  <CheckCircle size={48} className="text-sage mb-4" />
                  <p className="text-center">
                    No abnormalities detected that require immediate attention.
                  </p>
                  <p className="text-center text-sm text-ink-muted mt-4">
                    Routine follow-up as recommended by your healthcare
                    provider.
                  </p>
                </div>
              ) : (
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Consult with a neurologist or neurosurgeon</li>
                  <li>Additional imaging may be needed (e.g., contrast MRI)</li>
                  <li>Consider a biopsy for definitive diagnosis</li>
                  <li>Discuss treatment options with your healthcare team</li>
                  <li>Monitor for changes in symptoms</li>
                </ul>
              )}
            </div>
          </div>

          <div className="mt-8 p-4 bg-accent-dim border border-surface-border rounded-xl">
            <div className="flex items-start">
              <Thermometer className="text-accent-deep mr-3 mt-1" size={20} />
              <div>
                <h4 className="font-semibold mb-1">Important Note</h4>
                <p className="text-sm text-ink-muted">
                  This report is generated for informational purposes only and
                  should not be used as a substitute for professional medical
                  advice. Please consult with a qualified healthcare provider
                  for proper diagnosis and treatment recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About Brain Tumor Classification */}
      <div className="mt-12 bg-surface-warm p-8 rounded-2xl border border-surface-border">
        <h2 className="text-2xl font-semibold mb-4">
          About Brain Tumor Classification
        </h2>
        <p className="text-ink-muted mb-6">
          Our AI system is trained to identify and classify several types of
          brain tumors from MRI scans, including:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-cream-deep p-4 rounded-xl">
            <h3 className="font-semibold mb-2">Glioma</h3>
            <p className="text-sm text-ink-muted">
              Tumors that occur in the brain and spinal cord, starting in glial
              cells that surround nerve cells.
            </p>
          </div>
          <div className="bg-cream-deep p-4 rounded-xl">
            <h3 className="font-semibold mb-2">Meningioma</h3>
            <p className="text-sm text-ink-muted">
              Tumors that arise from the meninges — the membranes that surround
              the brain and spinal cord.
            </p>
          </div>
          <div className="bg-cream-deep p-4 rounded-xl">
            <h3 className="font-semibold mb-2">Pituitary</h3>
            <p className="text-sm text-ink-muted">
              Tumors that form in the pituitary gland, which is located at the
              base of the brain.
            </p>
          </div>
          <div className="bg-cream-deep p-4 rounded-xl">
            <h3 className="font-semibold mb-2">No Tumor</h3>
            <p className="text-sm text-ink-muted">
              Classification indicating no detectable tumor presence in the
              provided MRI scan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisPage;
