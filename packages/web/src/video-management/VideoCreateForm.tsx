import { Field, FieldProps } from 'formik';
import { FC } from 'react';
import FileUpload from '../ui-kit/FileUpload';
import InputSection from '../ui-kit/InputSection';
import InputTextArea from '../ui-kit/InputTextArea';

export interface IVideoCreateForm {
  fieldNames: {
    title: string;
    description: string;
    file: string;
  };
}

export const VideoCreateForm: FC<IVideoCreateForm> = (
  props: IVideoCreateForm,
) => {
  const { title, file, description } = props.fieldNames;

  return (
    <section className="space-y-4">
      <label className="block">
        <div className="mb-2 text-caption font-semibold">Title</div>
        <Field name={title}>
          {({ field, meta }: FieldProps<string>) => (
            <InputSection {...field} error={meta.touched && meta.error} />
          )}
        </Field>
      </label>
      <label className="block">
        <div className="mb-2 text-caption font-semibold">Description</div>
        <Field name={description}>
          {({ field }) => (
            <InputTextArea
              name={field.name}
              textareaProps={{ ...field, rows: 4, cols: 50 }}
            />
          )}
        </Field>
      </label>
      <label>
        <div className="mb-2 text-caption font-semibold">Video upload</div>
        <div className="text-caption">Acceptable file type: .mp4, .mov</div>
        <div className="text-caption">Max file size: 5GB</div>
      </label>
      <Field name={file}>
        {({ field, meta, form }: FieldProps<File>) => (
          <FileUpload
            name={field.name}
            value={field.value?.name}
            onChange={(event: React.ChangeEvent<{ files: File[] }>) =>
              form.setFieldValue(file, event.target.files[0])
            }
            label="Upload"
            accept={['.mp4', '.mov']}
            error={meta.touched && meta.error}
          />
        )}
      </Field>
    </section>
  );
};
