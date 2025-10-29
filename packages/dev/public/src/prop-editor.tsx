/**
 * Interactive prop editor component with modal-based prop addition
 */

import type React from 'react';
import { useState } from 'react';
import type { PropSchema } from '@bandofai/unido-core';

interface PropEditorProps {
  props: Record<string, any>;
  onChange: (props: Record<string, any>) => void;
  availableProps?: PropSchema;
}

export const PropEditor: React.FC<PropEditorProps> = ({ props, onChange, availableProps = {} }) => {
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState(JSON.stringify(props, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedPropName, setSelectedPropName] = useState<string>('');
  const [propValue, setPropValue] = useState<any>('');
  const [modalError, setModalError] = useState<string | null>(null);

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      onChange(parsed);
      setJsonError(null);
    } catch (err) {
      setJsonError((err as Error).message);
    }
  };

  const openModal = () => {
    // Reset modal state
    setSelectedPropName('');
    setPropValue('');
    setModalError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPropName('');
    setPropValue('');
    setModalError(null);
  };

  const handlePropNameChange = (name: string) => {
    setSelectedPropName(name);
    setModalError(null);

    // Set default value based on type
    const propSchema = availableProps[name];
    if (propSchema) {
      if (propSchema.defaultValue !== undefined) {
        setPropValue(propSchema.defaultValue);
      } else {
        // Set sensible defaults based on type
        switch (propSchema.type) {
          case 'string':
            setPropValue('');
            break;
          case 'number':
            setPropValue(0);
            break;
          case 'boolean':
            setPropValue(false);
            break;
          case 'enum':
            setPropValue(propSchema.enumValues?.[0] || '');
            break;
          case 'object':
            setPropValue('{}');
            break;
          case 'array':
            setPropValue('[]');
            break;
        }
      }
    }
  };

  const parseValueByType = (value: any, type: string): any => {
    switch (type) {
      case 'string':
        return String(value);
      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error('Invalid number');
        }
        return num;
      case 'boolean':
        return Boolean(value);
      case 'enum':
        return String(value);
      case 'object':
      case 'array':
        if (typeof value === 'string') {
          return JSON.parse(value);
        }
        return value;
      default:
        return value;
    }
  };

  const handleAddProp = () => {
    try {
      if (!selectedPropName) {
        setModalError('Please select a prop name');
        return;
      }

      const propSchema = availableProps[selectedPropName];
      let parsedValue = propValue;

      if (propSchema) {
        parsedValue = parseValueByType(propValue, propSchema.type);
      }

      onChange({ ...props, [selectedPropName]: parsedValue });
      closeModal();
    } catch (err) {
      setModalError((err as Error).message);
    }
  };

  const removeProp = (key: string) => {
    const newProps = { ...props };
    delete newProps[key];
    onChange(newProps);
  };

  const updateProp = (key: string, value: any) => {
    onChange({ ...props, [key]: value });
  };

  const renderInputForType = () => {
    if (!selectedPropName) {
      return null;
    }

    const propSchema = availableProps[selectedPropName];
    if (!propSchema) {
      // Fallback to text input
      return (
        <input
          type="text"
          style={styles.modalInput}
          value={propValue}
          onChange={(e) => setPropValue(e.target.value)}
          placeholder="Enter value"
        />
      );
    }

    switch (propSchema.type) {
      case 'string':
        return (
          <input
            type="text"
            style={styles.modalInput}
            value={propValue}
            onChange={(e) => setPropValue(e.target.value)}
            placeholder="Enter text"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            style={styles.modalInput}
            value={propValue}
            onChange={(e) => setPropValue(e.target.value)}
            placeholder="Enter number"
          />
        );

      case 'boolean':
        return (
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={Boolean(propValue)}
              onChange={(e) => setPropValue(e.target.checked)}
              style={styles.checkbox}
            />
            <span>{propValue ? 'True' : 'False'}</span>
          </label>
        );

      case 'enum':
        return (
          <select
            style={styles.modalInput}
            value={propValue}
            onChange={(e) => setPropValue(e.target.value)}
          >
            {propSchema.enumValues?.map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
        );

      case 'object':
      case 'array':
        return (
          <textarea
            style={styles.modalTextarea}
            value={typeof propValue === 'string' ? propValue : JSON.stringify(propValue, null, 2)}
            onChange={(e) => setPropValue(e.target.value)}
            placeholder={propSchema.type === 'object' ? '{}' : '[]'}
            spellCheck={false}
          />
        );

      default:
        return (
          <input
            type="text"
            style={styles.modalInput}
            value={propValue}
            onChange={(e) => setPropValue(e.target.value)}
          />
        );
    }
  };

  const hasSchema = Object.keys(availableProps).length > 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Props</span>
        <div style={styles.controls}>
          <button
            type="button"
            style={{
              ...styles.button,
              ...(jsonMode ? {} : styles.buttonActive),
            }}
            onClick={() => {
              setJsonMode(false);
              setJsonText(JSON.stringify(props, null, 2));
            }}
          >
            UI
          </button>
          <button
            type="button"
            style={{
              ...styles.button,
              ...(jsonMode ? styles.buttonActive : {}),
            }}
            onClick={() => {
              setJsonMode(true);
              setJsonText(JSON.stringify(props, null, 2));
            }}
          >
            JSON
          </button>
        </div>
      </div>

      {jsonMode ? (
        <div style={styles.jsonEditor}>
          <textarea
            style={styles.textarea}
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            spellCheck={false}
          />
          {jsonError && <div style={styles.error}>❌ {jsonError}</div>}
        </div>
      ) : (
        <div style={styles.uiEditor}>
          {Object.keys(props).length === 0 ? (
            <div style={styles.empty}>No props set. Click "Add Prop" to get started.</div>
          ) : (
            Object.entries(props).map(([key, value]) => (
              <div key={key} style={styles.propRow}>
                <label style={styles.label} htmlFor={`prop-${key}`}>
                  {key}
                </label>
                <div style={styles.inputGroup}>
                  <input
                    id={`prop-${key}`}
                    type="text"
                    style={styles.input}
                    value={typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        updateProp(key, parsed);
                      } catch {
                        updateProp(key, e.target.value);
                      }
                    }}
                  />
                  <button
                    type="button"
                    style={styles.removeButton}
                    onClick={() => removeProp(key)}
                    title="Remove prop"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
          <button type="button" style={styles.addButton} onClick={openModal}>
            + Add Prop
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Add Prop</h3>
              <button
                type="button"
                style={styles.modalCloseButton}
                onClick={closeModal}
                title="Close"
              >
                ×
              </button>
            </div>

            <div style={styles.modalBody}>
              {!hasSchema && (
                <div style={styles.warning}>
                  ⚠️ No props schema defined for this component. Add propsSchema to app.component()
                  for type-aware prop editing.
                </div>
              )}

              <div style={styles.modalField}>
                <label style={styles.modalLabel}>
                  Prop Name {hasSchema && <span style={styles.required}>*</span>}
                </label>
                {hasSchema ? (
                  <select
                    style={styles.modalInput}
                    value={selectedPropName}
                    onChange={(e) => handlePropNameChange(e.target.value)}
                  >
                    <option value="">Select a prop...</option>
                    {Object.entries(availableProps).map(([name, schema]) => (
                      <option key={name} value={name}>
                        {name}
                        {schema.required && ' *'}
                        {schema.description && ` - ${schema.description}`}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    style={styles.modalInput}
                    value={selectedPropName}
                    onChange={(e) => setSelectedPropName(e.target.value)}
                    placeholder="Enter prop name"
                  />
                )}
              </div>

              {selectedPropName && (
                <div style={styles.modalField}>
                  <label style={styles.modalLabel}>
                    Value
                    {availableProps[selectedPropName]?.type && (
                      <span style={styles.typeLabel}>
                        ({availableProps[selectedPropName].type})
                      </span>
                    )}
                  </label>
                  {renderInputForType()}
                </div>
              )}

              {modalError && <div style={styles.error}>❌ {modalError}</div>}
            </div>

            <div style={styles.modalFooter}>
              <button type="button" style={styles.cancelButton} onClick={closeModal}>
                Cancel
              </button>
              <button
                type="button"
                style={styles.addButtonModal}
                onClick={handleAddProp}
                disabled={!selectedPropName}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    marginTop: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    color: '#666',
  },
  controls: {
    display: 'flex',
    gap: '8px',
  },
  button: {
    padding: '4px 12px',
    border: '1px solid #e5e5e5',
    borderRadius: '4px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s',
  },
  buttonActive: {
    background: '#000',
    color: '#fff',
    borderColor: '#000',
  },
  jsonEditor: {
    marginTop: '12px',
  },
  textarea: {
    width: '100%',
    minHeight: '200px',
    padding: '12px',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '13px',
    resize: 'vertical' as const,
  },
  error: {
    marginTop: '8px',
    padding: '8px 12px',
    background: '#fee',
    color: '#c00',
    borderRadius: '4px',
    fontSize: '12px',
  },
  warning: {
    marginBottom: '16px',
    padding: '12px',
    background: '#fff3cd',
    color: '#856404',
    borderRadius: '6px',
    fontSize: '13px',
    lineHeight: 1.5,
  },
  uiEditor: {
    marginTop: '12px',
  },
  empty: {
    padding: '40px',
    textAlign: 'center' as const,
    color: '#999',
    fontSize: '14px',
  },
  propRow: {
    marginBottom: '12px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '6px',
  },
  inputGroup: {
    display: 'flex',
    gap: '8px',
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #e5e5e5',
    borderRadius: '6px',
    fontSize: '14px',
  },
  removeButton: {
    width: '32px',
    padding: '8px',
    border: '1px solid #e5e5e5',
    borderRadius: '6px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#999',
    transition: 'all 0.2s',
  },
  addButton: {
    width: '100%',
    padding: '10px',
    border: '2px dashed #e5e5e5',
    borderRadius: '8px',
    background: '#fafafa',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#666',
    transition: 'all 0.2s',
    marginTop: '12px',
  },

  // Modal styles
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: '#fff',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e5e5e5',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: 600,
    margin: 0,
  },
  modalCloseButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#999',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: '20px',
  },
  modalField: {
    marginBottom: '16px',
  },
  modalLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '8px',
    color: '#333',
  },
  required: {
    color: '#c00',
    marginLeft: '4px',
  },
  typeLabel: {
    fontSize: '12px',
    color: '#999',
    fontWeight: 400,
    marginLeft: '6px',
  },
  modalInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e5e5e5',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
  },
  modalTextarea: {
    width: '100%',
    minHeight: '120px',
    padding: '10px 12px',
    border: '1px solid #e5e5e5',
    borderRadius: '6px',
    fontSize: '13px',
    fontFamily: 'monospace',
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const,
  },
  checkbox: {
    marginRight: '8px',
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '14px',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '20px',
    borderTop: '1px solid #e5e5e5',
  },
  cancelButton: {
    padding: '10px 20px',
    border: '1px solid #e5e5e5',
    borderRadius: '6px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  },
  addButtonModal: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    background: '#000',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  },
};
