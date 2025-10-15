import React, { useRef, useState, useEffect, useCallback } from "react";
import EmailEditor from "react-email-editor";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Toast,
  ToastContainer,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";

const themes = {
  light: {
    bg: "#ffffff",
    text: "#212529",
    accent: "#0d6efd",
    cardBg: "#f8f9fa",
  },
  dark: {
    bg: "#212529",
    text: "#f8f9fa",
    accent: "#ffc107",
    cardBg: "#343a40",
  },
  ocean: {
    bg: "#e3f2fd",
    text: "#1565c0",
    accent: "#2196f3",
    cardBg: "#ffffff",
  },
  candy: {
    bg: "#fce4ec",
    text: "#c2185b",
    accent: "#e91e63",
    cardBg: "#ffffff",
  },
};

const EmailDesignerPro = () => {
  const emailEditorRef = useRef(null);
  const [parameters, setParameters] = useState([
    { key: "customer_name", value: "Amit Kumar" },
    { key: "plan_type", value: "Premium" },
  ]);
  const [theme, setTheme] = useState("ocean");
  const [toast, setToast] = useState({ show: false, message: "" });
  const [previewHtml, setPreviewHtml] = useState("");

  const notify = (msg) => setToast({ show: true, message: msg });

  // ======================
  // Save, Load, Export
  // ======================
  const saveDesign = useCallback(() => {
    emailEditorRef.current.editor.saveDesign((design) => {
      localStorage.setItem("emailTemplateDesign", JSON.stringify(design));
      notify("💾 Template saved successfully");
    });
  }, []);

  const loadDesign = () => {
    const saved = localStorage.getItem("emailTemplateDesign");
    if (saved) {
      emailEditorRef.current.editor.loadDesign(JSON.parse(saved));
      notify("♻️ Loaded saved template");
    } else {
      notify("⚠️ No saved design found");
    }
  };

  const exportHtml = useCallback((render = false) => {
    emailEditorRef.current.editor.exportHtml((data) => {
      let { html } = data;
      if (render) {
        parameters.forEach((p) => {
          const regex = new RegExp(`{{${p.key}}}`, "g");
          html = html.replace(regex, p.value || "");
        });
        setPreviewHtml(html);
        notify("👀 Preview updated");
      } else {
        const blob = new Blob([html], { type: "text/html" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "email_template.html";
        link.click();
        notify("🌐 Exported HTML successfully");
      }
    });
  }, [parameters]);

  // ======================
  // Parameter Handling
  // ======================
  const handleParamChange = (i, field, val) => {
    const updated = [...parameters];
    updated[i][field] = val;
    setParameters(updated);
  };

  const addParameter = () => {
    setParameters([...parameters, { key: "", value: "" }]);
  };

  const deleteParameter = (i) => {
    setParameters(parameters.filter((_, idx) => idx !== i));
  };

  // ======================
  // Insert Parameter Button
  // ======================
  const insertParam = (paramKey) => {
    emailEditorRef.current.editor.focus();
    emailEditorRef.current.editor.editorWindow.postMessage(
      { type: "insertText", text: `{{${paramKey}}}` },
      "*"
    );
    notify(`🔗 Inserted {{${paramKey}}}`);
  };

  // ======================
  // Keyboard Shortcuts
  // ======================
  useEffect(() => {
    const handleKey = (e) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        saveDesign();
      }
      if (e.ctrlKey && e.key === "e") {
        e.preventDefault();
        exportHtml(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [saveDesign, exportHtml]);

  // ======================
  // Auto-load Saved
  // ======================
  useEffect(() => {
    const saved = localStorage.getItem("emailTemplateDesign");
    if (saved) {
      notify("✨ Loaded saved session automatically");
    }
  }, []);

  const currentTheme = themes[theme];

  return (
    <div
      style={{
        background: currentTheme.bg,
        color: currentTheme.text,
        minHeight: "100vh",
        transition: "all 0.3s ease",
      }}
    >
      <Container fluid className="py-4">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-3 mb-4 p-4">
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <h2 className="mb-1 fw-bold text-primary">📧 Email Designer Pro</h2>
                  <p className="text-muted mb-0">Create professional email templates with dynamic parameters</p>
                </div>
              </div>
            </Col>
            <Col md={4} className="text-end">
              <div className="d-flex justify-content-end align-items-center gap-3">
                <span className="text-muted small">Theme:</span>
                <Form.Select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  size="sm"
                  style={{ width: "140px" }}
                >
                  <option value="light">🌤 Light</option>
                  <option value="dark">🌙 Dark</option>
                  <option value="ocean">🌊 Ocean</option>
                  <option value="candy">🍭 Candy</option>
                </Form.Select>
              </div>
            </Col>
          </Row>
        </div>

        <Row className="g-4">
          {/* Main Editor Area */}
          <Col lg={9}>
            <div className="bg-white rounded-3 shadow-sm overflow-hidden">
              <div className="border-bottom bg-light px-4 py-3">
                <h5 className="mb-0 fw-semibold text-dark">📝 Email Editor</h5>
                <small className="text-muted">Drag and drop elements to build your email template</small>
              </div>
              <div className="p-0">
                <EmailEditor
                  ref={emailEditorRef}
                  minHeight="70vh"
                  appearance={{
                    theme: theme === "dark" ? "dark" : "light",
                  }}
                  onLoad={() => {
                    const saved = localStorage.getItem("emailTemplateDesign");
                    if (saved) emailEditorRef.current.editor.loadDesign(JSON.parse(saved));
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-3 shadow-sm p-4 mt-4">
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <Button variant="success" size="sm" onClick={saveDesign} className="px-4">
                  <i className="fas fa-save me-2"></i>Save Template
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={loadDesign} className="px-4">
                  <i className="fas fa-folder-open me-2"></i>Load Template
                </Button>
                <Button variant="primary" size="sm" onClick={() => exportHtml(false)} className="px-4">
                  <i className="fas fa-download me-2"></i>Export HTML
                </Button>
                <Button variant="warning" size="sm" onClick={() => exportHtml(true)} className="px-4">
                  <i className="fas fa-eye me-2"></i>Live Preview
                </Button>
              </div>
            </div>
          </Col>

          {/* Parameter Sidebar */}
          <Col lg={3}>
            <div className="bg-white rounded-3 shadow-sm h-100">
              <div className="border-bottom bg-light px-4 py-3">
                <h5 className="mb-0 fw-semibold text-dark">⚙️ Dynamic Parameters</h5>
                <small className="text-muted">Add variables for your email template</small>
              </div>
              
              <div className="p-4">
                <div className="mb-3">
                  {parameters.map((p, i) => (
                    <div key={i} className="mb-3 p-3 border rounded bg-light">
                      <Row className="g-2 mb-2">
                        <Col xs={5}>
                          <Form.Control
                            size="sm"
                            value={p.key}
                            onChange={(e) => handleParamChange(i, "key", e.target.value)}
                            placeholder="Parameter"
                          />
                        </Col>
                        <Col xs={5}>
                          <Form.Control
                            size="sm"
                            value={p.value}
                            onChange={(e) => handleParamChange(i, "value", e.target.value)}
                            placeholder="Value"
                          />
                        </Col>
                        <Col xs={2}>
                          <div className="d-flex gap-1">
                            <OverlayTrigger overlay={<Tooltip>Insert into template</Tooltip>}>
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => insertParam(p.key)}
                                disabled={!p.key}
                              >
                                <i className="fas fa-plus"></i>
                              </Button>
                            </OverlayTrigger>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => deleteParameter(i)}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        </Col>
                      </Row>
                      {p.key && (
                        <small className="text-muted">
                          Use <code>{`{{${p.key}}}`}</code> in your template
                        </small>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="text-center">
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={addParameter}
                    className="w-100"
                  >
                    <i className="fas fa-plus me-2"></i>Add Parameter
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Live Preview */}
        {previewHtml && (
          <div className="bg-white rounded-3 shadow-sm mt-4">
            <div className="border-bottom bg-light px-4 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0 fw-semibold text-dark">👁️ Live Preview</h5>
                  <small className="text-muted">See how your email looks with actual parameter values</small>
                </div>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => setPreviewHtml("")}
                >
                  <i className="fas fa-times"></i> Close
                </Button>
              </div>
            </div>
            <div className="p-0">
              <iframe
                title="Email Preview"
                srcDoc={previewHtml}
                style={{ 
                  width: "100%", 
                  height: "60vh", 
                  border: "none",
                  borderRadius: "0 0 1rem 1rem"
                }}
              />
            </div>
          </div>
        )}

        {/* Toast Notification */}
        <ToastContainer position="bottom-end" className="p-4">
          <Toast
            show={toast.show}
            delay={3000}
            autohide
            onClose={() => setToast({ ...toast, show: false })}
            className="border-0 shadow"
          >
            <Toast.Header closeButton={false} className="bg-success text-white">
              <strong className="me-auto">
                <i className="fas fa-check-circle me-2"></i>
                Success
              </strong>
            </Toast.Header>
            <Toast.Body className="bg-light">
              {toast.message}
            </Toast.Body>
          </Toast>
        </ToastContainer>
      </Container>
    </div>
  );
};

export default EmailDesignerPro;