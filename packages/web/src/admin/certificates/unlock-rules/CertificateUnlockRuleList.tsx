import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { FunctionComponent } from 'react';

import Button from '../../../ui-kit/Button';
import Pagination from '../../../ui-kit/Pagination';
import WEB_PATHS from '../../../constants/webPaths';
import ListSearch from '../../../ui-kit/ListSearch';
import InputCheckbox from '../../../ui-kit/InputCheckbox';
import { TableColumn, TableHead } from '../../../ui-kit/Table';
import { ICertificateUnlockRule } from '../../../models/certificateUnlockRule';

interface IProps {
  certificateUnlockRules: ICertificateUnlockRule[];
  totalPages?: number;
  onClickSelect: (string) => void;
  isSelectAll: boolean;
  setSelectAll: (boolean) => void;
  selectedCertificateUnlockRules: string[];
}

interface ICertificateUnlockRuleItemProps {
  certificateUnlockRule: ICertificateUnlockRule;
  checked: boolean;
  onClickSelect: (string) => void;
}

const CertificateUnlockRule: FunctionComponent<ICertificateUnlockRuleItemProps> =
  ({ certificateUnlockRule, checked, onClickSelect }) => {
    const router = useRouter();
    const routeToDetail = (certificateUnlockRuleId: string) => {
      router.push(
        WEB_PATHS.CERTIFICATE_UNLOCK_RULE_DETAIL.replace(
          ':id',
          certificateUnlockRuleId,
        ),
      );
    };

    return (
      <tr
        className="hover:bg-gray-100"
        onClick={() => onClickSelect(certificateUnlockRule.id)}
      >
        <TableColumn>
          <InputCheckbox
            inputClassName="cursor-pointer"
            name={`checkbox-${certificateUnlockRule.id}`}
            checked={checked}
            readOnly={true}
          />
        </TableColumn>
        <TableColumn>{certificateUnlockRule.ruleName}</TableColumn>
        <TableColumn>{certificateUnlockRule.certificate?.title}</TableColumn>
        <TableColumn>{certificateUnlockRule.unlockType}</TableColumn>
        <TableColumn>
          {format(
            new Date(certificateUnlockRule.createdAt),
            'dd MMMM yyyy H:mm',
          )}
        </TableColumn>
        <TableColumn>
          {certificateUnlockRule.createdBy.firstName
            ? `${certificateUnlockRule.createdBy.firstName} ${certificateUnlockRule.createdBy.lastName}`
            : certificateUnlockRule.createdBy.email}
        </TableColumn>
        <TableColumn>
          {certificateUnlockRule.lastModifiedBy.firstName
            ? `${certificateUnlockRule.lastModifiedBy.firstName} ${certificateUnlockRule.lastModifiedBy.lastName}`
            : certificateUnlockRule.lastModifiedBy.email}
        </TableColumn>

        <TableColumn>
          <Button
            variant="primary"
            size="small"
            type="button"
            className="flex-shrink-0 py-2"
            onClick={() => routeToDetail(certificateUnlockRule.id)}
          >
            Edit
          </Button>
        </TableColumn>
      </tr>
    );
  };

const CertificateUnlockRuleList: FunctionComponent<IProps> = (props) => {
  const sortOptions = [
    { label: 'Created Date', value: 'createdAt' },
    { label: 'Name', value: 'ruleName' },
  ];
  const searchOptions = [{ label: 'Rule Name', value: 'ruleName' }];
  return (
    <>
      <ListSearch
        defaultSearchField="name"
        fieldOptions={searchOptions}
        sortOptions={sortOptions}
      />
      <div className="my-4 overflow-x-scroll rounded bg-white shadow-md">
        <table className="w-full table-auto border-collapse border text-left">
          <thead>
            <tr>
              <TableHead className="w-min">
                <InputCheckbox
                  name="checkbox-header"
                  checked={props.isSelectAll}
                  onChange={() => {
                    props.setSelectAll(!props.isSelectAll);
                  }}
                />
              </TableHead>
              <TableHead className="w-1/8">Rule Name</TableHead>
              <TableHead className="w-1/8">Certificate Name</TableHead>
              <TableHead className="w-1/8">Certificate Type</TableHead>
              <TableHead className="w-1/8">Created On</TableHead>
              <TableHead className="w-1/8">Created By</TableHead>
              <TableHead className="w-1/8">Last Modified By</TableHead>
              <TableHead className="w-1/8">Actions</TableHead>
            </tr>
          </thead>
          <tbody>
            {props.certificateUnlockRules &&
            props.certificateUnlockRules.length > 0 ? (
              props.certificateUnlockRules.map((certificateUnlockRule) => (
                <CertificateUnlockRule
                  key={certificateUnlockRule.id}
                  certificateUnlockRule={certificateUnlockRule}
                  onClickSelect={props.onClickSelect}
                  checked={props.selectedCertificateUnlockRules.includes(
                    certificateUnlockRule.id,
                  )}
                />
              ))
            ) : (
              <tr className="text-center hover:bg-gray-100">
                <TableColumn colSpan={5}>No records found!</TableColumn>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {props.totalPages > 0 && <Pagination totalPages={props.totalPages} />}
    </>
  );
};

export default CertificateUnlockRuleList;
