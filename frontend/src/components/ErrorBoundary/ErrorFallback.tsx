/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, createElement, ErrorInfo, isValidElement, useEffect } from 'react';
import Layout, { Content } from 'antd/es/layout/layout';
import { ErrorBoundaryContext } from './Context';
import { ErrorBoundaryProps, ErrorBoundaryState, FallbackProps } from './types';

const initialState: ErrorBoundaryState = {
	didCatch: false,
	error: null,
	errorInfo: null
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);

		this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
		this.state = initialState;
	}

	static getDerivedStateFromError(error: Error) {
		return { didCatch: true, error };
	}

	resetErrorBoundary(...args: any[]) {
		const { error } = this.state;

		if (error !== null) {
			this.props.onReset?.({
				args,
				reason: 'imperative-api'
			});

			this.setState(initialState);
		}
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		this.props.onError?.(error, errorInfo);
		this.setState({ errorInfo });
	}

	componentDidUpdate(prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
		const { didCatch } = this.state;
		const { resetKeys } = this.props;

		// There's an edge case where if the thing that triggered the error happens to *also* be in the resetKeys array,
		// we'd end up resetting the error boundary immediately.
		// This would likely trigger a second error to be thrown.
		// So we make sure that we don't check the resetKeys on the first call of cDU after the error is set.

		if (didCatch && prevState.error !== null && hasArrayChanged(prevProps.resetKeys, resetKeys)) {
			this.props.onReset?.({
				next: resetKeys,
				prev: prevProps.resetKeys,
				reason: 'keys'
			});

			this.setState(initialState);
		}
	}

	render() {
		const { children, fallbackRender, FallbackComponent, fallback } = this.props;
		const { didCatch, error, errorInfo } = this.state;

		let childToRender = children;

		if (didCatch) {
			const props: FallbackProps = {
				error,
				errorInfo,
				resetErrorBoundary: this.resetErrorBoundary
			};

			if (typeof fallbackRender === 'function') {
				childToRender = fallbackRender(props);
			} else if (FallbackComponent) {
				childToRender = createElement(FallbackComponent, props);
			} else if (fallback === null || isValidElement(fallback)) {
				childToRender = fallback;
			} else {
				console.error('react-error-boundary requires either a fallback, fallbackRender, or FallbackComponent prop');

				throw error;
			}
		}

		return createElement(
			ErrorBoundaryContext.Provider,
			{
				value: {
					didCatch,
					error,
					errorInfo,
					resetErrorBoundary: this.resetErrorBoundary
				}
			},
			childToRender
		);
	}
}

function hasArrayChanged(a: any[] = [], b: any[] = []) {
	return a.length !== b.length || a.some((item, index) => !Object.is(item, b[index]));
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const ErrorFallback = ({ error, errorInfo }: { error: Error; resetErrorBoundary?: Function; errorInfo?: ErrorInfo }) => {
	// Call resetErrorBoundary() to reset the error boundary and retry the render.
	useEffect(() => {
		console.error(error, errorInfo);
	});
	return (
		<Layout>
			<Content>
				<div role="alert">
					<p>Something went wrong:</p>
					<pre style={{ color: 'red' }}>{error ? error.toString() : `Error has no toString() method, is: ${error}`}</pre>
					{errorInfo?.componentStack ? <pre style={{ color: 'red' }}>{errorInfo.componentStack}</pre> : null}
				</div>
			</Content>
		</Layout>
	);
};
