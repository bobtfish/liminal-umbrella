/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, createRef, useEffect, type RefObject } from 'react';
import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import Form from 'antd/es/form';
import Button from 'antd/es/button';
import { Spin } from '../../components/Spin';
import { ErrorFallback } from '../../components/ErrorBoundary';
import { Store } from 'rc-field-form/lib/interface';
import { SaveOutlined } from '@ant-design/icons';
import { ColProps } from 'antd';
import { FormInstance } from 'antd/es/form';
import { useMutationErrorToFormError } from './hooks';
import { Keyable, MutationReturn } from './types';
import { useLocation } from 'react-router-dom';

export function CreateForm<T>({
    mutation,
    children,
    initialValues,
    submitButton = true,
    submitButtonText = 'Submit',
    style,
    labelCol,
    wrapperCol,
    hidden = false,
    formRef
}: {
     
    mutation: UseMutationResult<MutationReturn<T & Keyable>, Error, any>;
    children: React.ReactNode;
    initialValues?: Store | undefined;
    submitButton?: boolean;
    submitButtonText?: string;
    style?: React.CSSProperties;
    labelCol?: ColProps;
    wrapperCol?: ColProps;
    hidden?: boolean;
    formRef?: RefObject<FormInstance<T>>;
}) {
    labelCol ||= { span: 5 };
    wrapperCol ||= { span: 19 };
    const [isSubmittable, setSubmittable] = useState(false);
    const [form] = Form.useForm<T>();
    // eslint-disable-next-line @eslint-react/no-create-ref
    if (!formRef) formRef = createRef<FormInstance<T>>();
    const values = Form.useWatch([], form);
    const mutationErrorToFormError = useMutationErrorToFormError();

    useEffect(() => {
        form.validateFields({})
            .then(() => { setSubmittable(true); })
            .catch(() => { setSubmittable(false); });
    }, [form, values]);

    if (hidden) {
        return <></>;
    }
    return (
        <Form<T>
            style={style}
            ref={formRef}
            form={form}
            initialValues={initialValues}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            onFinish={(values) => {
                mutation.mutate(values, {
                    onError: (e) => {
                        mutationErrorToFormError(form, e);
                    },
                    onSuccess: () => {
                        form.resetFields();
                    }
                });
            }}
        >
            <>{children}</>
            {submitButton ? (
                <Form.Item>
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', margin: 0, padding: 0 }}>
                        <Button icon={<SaveOutlined />} type="primary" htmlType="submit" disabled={!isSubmittable}>
                            {submitButtonText}
                        </Button>
                    </div>
                </Form.Item>
            ) : (
                <></>
            )}
        </Form>
    );
}

export function AddRow<T>({ createMutation, children }: { createMutation: UseMutationResult<MutationReturn<T & Keyable>, Error, any>; children: React.ReactNode }) {
    const [isCreating, setIsCreating] = useState(false);
    let button = <></>;
    if (!isCreating) {
        button = (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Button onClick={() => { setIsCreating(true); }} type="primary" style={{ marginBottom: 16 }}>
                    Add a row
                </Button>
            </div>
        );
    }
    return (
        <>
            {button}
            {CreateForm<T>({
                labelCol: { span: 2 },
                wrapperCol: { span: 22 },
                hidden: !isCreating,
                mutation: createMutation,
                children
            })}
        </>
    );
}

export function WrapCRUD<Res>({
    spin = false,
    children,
    result
}: {
    spin?: boolean;
    children: React.ReactNode;
    result: UseQueryResult<Res[]>;
}) {
    const { pathname } = useLocation();
    const spintip = `Loading data for${pathname.replaceAll('/', ' ')}`
    const spinner = (spin || result.isLoading) ? <Spin tip={spintip} /> : <></>;
    if (result.isError)
        return <>{spinner}<ErrorFallback error={result.error} /></>;
    return <>{spinner}<div style={{ display: 'block' }}>{children}</div></>;
}
