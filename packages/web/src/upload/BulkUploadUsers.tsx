import { useState } from 'react';
import { TiTick } from 'react-icons/ti';
import { VscError } from 'react-icons/vsc';

import InputRadio from '../ui-kit/InputRadio';
import { EMAIL_PATTERN } from '../constants/regex';
import { TableColumn, TableHead } from '../ui-kit/Table';
import { convertExcelToJson } from '../utils/file-helper';

export default function BulkUploadUsers({ uploadFile }): JSX.Element {
  const fileHeaders = ['first_name', 'last_name', 'email', 'is_activated'];
  const uploadOptions = [
    {
      title: 'Skip, If users already exist.',
      value: 'skip',
    },
    {
      title: 'Update empty fields, If users already exist.',
      value: 'update',
    },
    {
      title: 'Replace every fields, If users already exist.',
      value: 'replace',
    },
  ];
  const [selectedOption, setSelectedOption] = useState('skip');
  const [loadingState, setLoadingState] = useState(false);
  const [userList, setUserList] = useState([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fileKey, setFileKey] = useState(1);
  const [files, setFiles] = useState([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFileChange = async (e: any, files: FileList) => {
    setLoadingState(true);
    const results = await convertExcelToJson(files[0]);

    for (const result of results) {
      if (!result.email || !EMAIL_PATTERN.test(result.email)) {
        alert(
          `${result.email ? 'Invalid email: ' : 'Email should not be empty'}${
            result.email
          }`,
        );

        e.target.value = null;
        return;
      }
    }

    setFiles([files[0]]);
    setUserList(results);

    setLoadingState(false);
  };

  const handleSubmit = async () => {
    if (loadingState) return;

    try {
      await uploadFile(files[0], selectedOption);
    } catch (error) {
      alert(error.data.error + ', Please update and try again.');
    }
  };

  const handleRadioChange = async (value: string) => {
    setSelectedOption(value);
  };

  const renderBoolean = (booleanVal = false) => {
    if (booleanVal) {
      return <TiTick />;
    }
    return <VscError />;
  };

  const renderRadio = () => {
    return (
      <div>
        <h3 className="text-md font-bold">Upload Condition</h3>
        <div className="mb-5">
          {uploadOptions.map((option) => {
            return (
              <div key={option.value}>
                <label className="cursor-pointer">
                  <InputRadio
                    inputClassName="shadow-none"
                    label={option.title}
                    name="uploadOptions"
                    value={option.value}
                    checked={selectedOption === option.value}
                    onChange={(e) => handleRadioChange(e.target.value)}
                  />
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTable = () => {
    if (userList.length <= 0) return;

    const renderHeads = () => {
      if (userList.length <= 0) return;

      return (
        <tr>
          {fileHeaders.map((header) => {
            return <TableHead key={header}>{header}</TableHead>;
          })}
        </tr>
      );
    };

    const renderRows = () => {
      if (userList.length <= 0) return;

      return userList.map((data, i) => {
        return (
          <tr key={'user-' + i} className="hover:bg-gray-100">
            {fileHeaders.map((key, ki) => {
              return typeof data[key] === 'boolean' ? (
                <TableColumn key={'data-' + ki}>
                  {renderBoolean(data[key])}
                </TableColumn>
              ) : (
                <TableColumn key={'data-' + ki}>{data[key]}</TableColumn>
              );
            })}
          </tr>
        );
      });
    };

    return (
      <div className="my-5">
        <table className="w-full border-collapse border text-left">
          <thead>{renderHeads()}</thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <div className="rounded bg-white p-5">
        <div className="mb-5 flex content-between items-center">
          <div className="flex-1">
            <h1 className="text-lg font-bold">Bulk Upload User</h1>
          </div>
          <a href="/assets/user_template.xlsx" target="_blank" download>
            <button className="rounded bg-green-300 py-2 px-4 text-white hover:bg-green-200">
              Download Template
            </button>
          </a>
        </div>
        <hr className="mb-5" />
        <div className="mb-5">
          <input
            type="file"
            key={fileKey}
            accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(e) => handleFileChange(e, e.target.files)}
          />
        </div>
        {renderRadio()}
        <hr />
        {renderTable()}
        <hr className="mb-5" />
        <div>
          <button
            className="rounded bg-blue-400 py-2 px-4 text-white hover:bg-blue-300"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
}
