import Table from 'antd/es/table';
import Spin from 'antd/es/spin';
import Divider from 'antd/es/divider'
import { getTableComponents, ColumnTypes, getQueries, getColumns, DefaultColumns, WrapCRUD } from '../CRUD.js';
import { RoleSchema } from 'common/schema';

interface FetchRoleItem { key: number, name: string }

const formRule = RoleSchema.formRule
const components = getTableComponents(formRule);

export default function AdminRoles() {
  const { result, isMutating, handleSave } = getQueries<FetchRoleItem>('/api/role', 'role')

  const defaultColumns: DefaultColumns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        editable: false,
      },
    ];

  const columns = getColumns<FetchRoleItem>(defaultColumns, handleSave);

  return <WrapCRUD<FetchRoleItem> result={result}>
    <>
      <Spin spinning={isMutating} fullscreen />
      <div>
        This page is for Roles
      </div>
      <Divider />

      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={result.data!}
        columns={columns as ColumnTypes}
      />
    </>
  </WrapCRUD>
}
