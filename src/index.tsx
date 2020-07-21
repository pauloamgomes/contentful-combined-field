/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from 'react';
import { render } from 'react-dom';
import { init, FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import format from 'date-fns/format';
//==
import './index.css';

interface CombinedFieldProps {
  sdk: FieldExtensionSDK;
}

export const CombinedField = ({ sdk }: CombinedFieldProps) => {
  let debounceInterval = 0;
  let detachExternalChangeHandler: Function | null = null;

  const fieldName = sdk.field.id;
  const instance: any = sdk.parameters.instance;
  const { pattern, readonly, separator } = instance;

  const parts: string[] = [];

  pattern.replace(/\[(.*?)]/g, (a: string, b: string) => {
    parts.push(b);
    return '';
  });

  const [value, setValue] = React.useState('');
  const fields: string[] = [];

  React.useEffect(() => {
    sdk.window.startAutoResizer();

    parts.forEach((part: string) => {
      if (part.startsWith('field:')) {
        fields.push(part.replace('field:', ''));
      }
    });

    // Create a listener for each field and matching locales.
    fields.forEach((field: string) => {
      const fieldParts = field.split(':');
      const fieldName = fieldParts.length === 1 ? field : fieldParts[0];
      if (Object.prototype.hasOwnProperty.call(sdk.entry.fields, fieldName)) {
        const locales = sdk.entry.fields[fieldName].locales;

        locales.forEach((locale: string) => {
          sdk.entry.fields[fieldName].onValueChanged(locale, () => {
            if (debounceInterval) {
              clearInterval(debounceInterval);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
            debounceInterval = window.setTimeout(() => {
              updateFieldValue(locale);
            }, 500);
          });
        });
      }
    });

    // Handler for external field value changes (e.g. when multiple authors are working on the same entry).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    detachExternalChangeHandler = sdk.field.onValueChanged(onExternalChange);

    return () => {
      if (detachExternalChangeHandler) {
        detachExternalChangeHandler();
      }
    };
  }, []);

  /**
   * Retrieves the raw value from a referenced field.
   */
  const getReferenceFieldValue = async (
    fieldName: string,
    subFieldName: string,
    locale: string
  ) => {
    const defaultLocale = sdk.locales.default;
    const referenceLocale = sdk.entry.fields[fieldName].locales.includes(locale)
      ? locale
      : defaultLocale;

    const reference = sdk.entry.fields[fieldName].getValue(referenceLocale);
    if (!reference) {
      return '';
    }
    const result: any = await sdk.space.getEntry(reference.sys.id);
    const { fields } = result;

    if (!fields) {
      return '';
    }

    if (!Object.prototype.hasOwnProperty.call(fields, subFieldName)) {
      return '';
    }

    if (Object.prototype.hasOwnProperty.call(fields[subFieldName], locale)) {
      return fields[subFieldName][locale];
    }

    if (Object.prototype.hasOwnProperty.call(fields[subFieldName], defaultLocale)) {
      return fields[subFieldName][defaultLocale];
    }

    return '';
  };

  /**
   * Updates the field based on the defined pattern.
   */
  const updateFieldValue = async (locale: string) => {
    const defaultLocale = sdk.locales.default;
    const newParts: string[] = [];

    for (const part of parts) {
      if (part.startsWith('field:')) {
        const fieldParts = part.split(':');
        let raw = '';

        if (fieldParts.length === 2) {
          if (sdk.entry.fields[fieldParts[1]] !== undefined) {
            if (sdk.entry.fields[fieldParts[1]].locales.includes(locale)) {
              raw = sdk.entry.fields[fieldParts[1]].getValue(locale) || '';
            } else {
              raw = sdk.entry.fields[fieldParts[1]].getValue(defaultLocale) || '';
            }
          }
        } else {
          raw = await getReferenceFieldValue(fieldParts[1], fieldParts[2], locale);
        }

        newParts.push(raw);
      } else if (part === 'locale') {
        newParts.push(locale);
      } else if (part.startsWith('date:')) {
        newParts.push(format(new Date(), part.split(':')[1]));
      } else {
        newParts.push(part);
      }
    }

    let newValue = pattern;
    parts.forEach((part, idx) => {
      if (newParts[idx] && newParts[idx].length) {
        newValue = newValue.replace(`[${part}]`, newParts[idx]);
      } else {
        newValue = newValue.replace(`[${part}]`, '');
      }
    });

    if (newValue.startsWith(separator)) {
      newValue = newValue.replace(new RegExp('^' + separator, 'g'), '');
    }

    sdk.entry.fields[fieldName].setValue(newValue, locale);
  };

  const onExternalChange = (value: string) => {
    setValue(value);
  };

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    if (value) {
      setValue(value);
      await sdk.field.setValue(value);
    } else {
      await sdk.field.removeValue();
    }
  };

  return (
    <div className="container">
      <input
        width="large"
        id="combined-field"
        name="combined"
        value={value || ''}
        onChange={onChange}
        readOnly={readonly}
        className={(readonly && 'disabled') || ''}
      />
      {!readonly && <button onClick={() => updateFieldValue(sdk.field.locale)}>reset</button>}
    </div>
  );
};

init(sdk => {
  render(<CombinedField sdk={sdk as FieldExtensionSDK} />, document.getElementById('root'));
});
