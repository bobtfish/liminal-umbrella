import { createContext, useState } from 'react';

export const DebugContext = createContext({ debug: false, setDebug: (_: boolean) => {} });
export function MaybeDebug({ children }: { children: React.ReactNode }) {
	const [debug, setDebug] = useState(false);
	return <DebugContext.Provider value={{ debug, setDebug }}>{children}</DebugContext.Provider>;
}
