import * as React from 'react';
import Layout, { Header, Footer, Content } from 'antd/es/layout/layout';
import Menu from 'antd/es/menu/menu';
import ConfigProvider from 'antd/es/config-provider';
import Avatar from 'antd/es/avatar/avatar';
import {
	UserOutlined,
	BugOutlined,
	SettingOutlined,
	TeamOutlined,
	ExportOutlined,
	EyeOutlined,
	PlayCircleOutlined,
	MessageOutlined,
	UsergroupAddOutlined,
	AppstoreAddOutlined,
	LogoutOutlined
} from '@ant-design/icons';
import { BrowserRouter as Router, Route, Routes, useNavigate, Link, useLocation } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import Spin from './components/Spin.js';
import { MaybeDebug, DebugContext } from './Debug';
import { ProtectedRoute } from './ProtectedRoute';
import HomePage from './Homepage';
import { AuthProvider, isAuthenticated, isAdmin, isDM, isBotBetaTester, isAuthFetching, getLogoutMutation } from './Auth';

import Login from './Login';
import AdminUsers from './admin/Users';
import AdminCogs from './admin/Cogs';
import AdminRoles from './admin/Roles';
import AdminGamesystems from './admin/Gamesystems';
import AdminBotplaying from './admin/Botplaying';
import AdminBotMessages from './admin/BotMessages';
import NewGame from './dm/NewGame';
import ViewGames from './dm/ViewGames';
import ViewGame from './dm/ViewGame';
import NotFound from './NotFound';
import { ErrorFallback, ErrorBoundary } from './ErrorFallback';
import { AnyObject } from 'antd/es/_util/type.js';

const ReactQueryDevtools = React.lazy(() =>
	import('@tanstack/react-query-devtools/build/modern/production.js').then((d) => ({
		default: d.ReactQueryDevtools
	}))
);

function TopMenu() {
	const { debug, setDebug } = React.useContext(DebugContext);
	const location = useLocation();
	const doLogout = getLogoutMutation();
	const { pathname } = location;
	const auth = isAuthenticated();

	const avatarSrc = auth ? auth.user.avatarURL : null;
	const avatarIcon = auth ? null : <UserOutlined />;

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
			doLogout();
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

function PageContent() {
	return (
		<Routes>
			<Route path="/login" element={<Login />} />
			<Route path="/" element={<ProtectedRoute />}>
				<Route path="/" element={<HomePage />} />
				<Route path="/" element={<ProtectedRoute role="Admin" />}>
					<Route path="/admin/cogs" element={<AdminCogs />} />
					<Route path="/admin/gamesystems" element={<AdminGamesystems />} />
					<Route path="/admin/botplaying" element={<AdminBotplaying />} />
					<Route path="/admin/botmessages" element={<AdminBotMessages />} />
					<Route path="/admin/users" element={<AdminUsers />} />
					<Route path="/admin/roles" element={<AdminRoles />} />
				</Route>
				<Route path="/" element={<ProtectedRoute isBotBetaTester role="Dungeon Master" />}>
					<Route path="/dm/newgame" element={<NewGame />} />
					<Route path="/dm/viewgames" element={<ViewGames />} />
					<Route path="/dm/viewgame/:key" element={<ViewGame />} />
				</Route>
			</Route>
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
}

function AuthLoadingSpinner({ children }: { children: React.ReactNode }) {
	if (isAuthFetching()) {
		return <Spin />;
	}
	return children;
}

function checkIsMobile(): boolean {
	var isMobile = false;

	if ('maxTouchPoints' in navigator) {
		isMobile = navigator.maxTouchPoints > 0;
	}
	return isMobile;
}

function Page() {
	const isMobile = checkIsMobile();
	const style: AnyObject = {
		minHeight: 280,
		paddingLeft: 0,
		margin: isMobile ? 0 : '2em'
	};
	if (isMobile) {
		style['width'] = '100%';
	}
	return (
		<Layout style={style}>
			<TopMenu />
			<Content>
				<div
					style={{
						minHeight: 280,
						padding: isMobile ? 0 : '2em',
					}}
				>
					<ErrorBoundary FallbackComponent={ErrorFallback}>
						<AuthLoadingSpinner>
							<PageContent />
						</AuthLoadingSpinner>
					</ErrorBoundary>
				</div>
			</Content>
			<Footer style={{ textAlign: 'center' }}>Preston RPG Discord Admins ©{new Date().getFullYear()} built with ❤️ by Tomas D</Footer>
		</Layout>
	);
}

function AppRouter() {
	const queryClient = new QueryClient();
	const { debug } = React.useContext(DebugContext);

	return (
		<Router>
			<QueryClientProvider client={queryClient}>
				{debug && (
					<React.Suspense fallback={null}>
						<ReactQueryDevtools />
					</React.Suspense>
				)}
				<ConfigProvider
					theme={{
						token: { colorPrimary: '#00b96b' }
					}}
				>
					<AuthProvider>
						<Page />
					</AuthProvider>
				</ConfigProvider>
			</QueryClientProvider>
		</Router>
	);
}

function App() {
	return (
		<MaybeDebug>
			<AppRouter />
		</MaybeDebug>
	);
}

export default App;
