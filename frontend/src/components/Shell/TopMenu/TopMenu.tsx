import Avatar from 'antd/es/avatar';
import { Header } from 'antd/es/layout/layout';
import Menu from 'antd/es/menu';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useLogoutMutation, useAuthStatus } from '../../Auth';
import { DebugContext } from '../../Debug';
import React from 'react';
import {
	BugOutlined,
	LogoutOutlined,
	UserOutlined,
	SettingOutlined,
	UsergroupAddOutlined,
	AppstoreAddOutlined,
	PlayCircleOutlined,
	MessageOutlined,
	TeamOutlined,
	ExportOutlined,
	EyeOutlined
} from '@ant-design/icons/lib/icons';

export function TopMenu() {
	const { logoutMutation } = useLogoutMutation();
	const { isAuthenticated, isBotBetaTester, isAdmin, isDM } = useAuthStatus();
	const { debug, setDebug } = React.useContext(DebugContext);
	const location = useLocation();
	const { pathname } = location;
	const auth = isAuthenticated();

	const avatarSrc = auth ? auth.user.avatarURL : null;
	const avatarIcon = auth ? null : <UserOutlined />;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const items: any = [];

	const beta = isBotBetaTester();
	const admin = isAdmin();
	if (admin) {
		items.push({
			key: 'admin',
			label: 'Admin',
			icon: <SettingOutlined />,
			children: [
				/*{
          key: 'admin/cogs',
          label: 'Cogs',
        },*/
				{
					key: '/admin/users',
					label: 'Users',
					icon: <UserOutlined />
				},
				{
					key: '/admin/roles',
					label: 'Roles',
					icon: <UsergroupAddOutlined />
				},
				{
					key: '/admin/gamesystems',
					label: 'Gamesystems',
					icon: <AppstoreAddOutlined />
				},
				{
					key: '/admin/botplaying',
					label: 'Bot Playing',
					icon: <PlayCircleOutlined />
				},
				{
					key: '/admin/botmessages',
					label: 'Bot Messages',
					icon: <MessageOutlined />
				}
			]
		});
	}

	const dm = isDM();
	if (dm && beta) {
		items.push({
			key: 'dm',
			label: 'DM',
			icon: <TeamOutlined />,
			children: [
				{
					key: '/dm/newgame',
					label: 'New Game',
					icon: <ExportOutlined />
				},
				{
					key: '/dm/viewgames',
					label: 'View Games',
					icon: <EyeOutlined />
				}
			]
		});
	}

	if (admin) {
		items.push({
			icon: <BugOutlined />,
			key: debug ? 'debug-off' : 'debug-on',
			label: debug ? 'Debug On' : 'Debug Off',
			danger: debug ? true : false
		});
	}
	if (isAuthenticated()) {
		items.push({
			key: 'logout',
			icon: <LogoutOutlined />,
			label: 'Logout'
		});
	}

	const navigate = useNavigate();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleMenuClick = ({ key }: any) => {
		if (key == 'debug-on') {
			setDebug(true);
			return;
		}
		if (key == 'debug-off') {
			setDebug(false);
			return;
		}
		if (key == 'logout') {
			logoutMutation();
			return;
		}
		if (key) {
			navigate(key);
		}
	};

	return (
		<Header style={{ padding: '0 1em', display: 'flex', alignItems: 'center' }}>
			<Link
				to="/"
				children={
					<Avatar icon={avatarIcon} src={avatarSrc} style={{ marginRight: '1em' }} shape="square" size="large" className="avatarIcon" />
				}
			/>
			<Menu
				style={{ minWidth: 0, flex: 'auto' }}
				theme="dark"
				mode="horizontal"
				items={items}
				onClick={handleMenuClick}
				selectedKeys={[pathname]}
			/>
		</Header>
	);
}