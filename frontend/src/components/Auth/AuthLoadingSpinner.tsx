import { Spin } from '../Spin';
import { useAuthStatus } from './hooks';

export function AuthLoadingSpinner({ children }: { children: React.ReactNode }) {
	const { isAuthFetching } = useAuthStatus();
	if (isAuthFetching()) {
		return <Spin />;
	}
	return children;
}