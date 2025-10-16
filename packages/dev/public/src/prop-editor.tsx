/**
 * Interactive prop editor component
 */

import type React from 'react';
import { useState } from 'react';

interface PropEditorProps {
  props: Record<string, any>;
  onChange: (props: Record<string, any>) => void;
}

export const PropEditor: React.FC<PropEditorProps> = ({ props, onChange }) => {
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState(JSON.stringify(props, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

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

  const addProp = () => {
    const key = prompt('Property name:');
    if (key && !props[key]) {
      onChange({ ...props, [key]: '' });
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
          <button type="button" style={styles.addButton} onClick={addProp}>
            + Add Prop
          </button>
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
};
