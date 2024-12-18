import { type RefObject } from 'react';
import Form, { FormInstance, Rule, type FormItemProps } from 'antd/es/form';
import Input from 'antd/es/input';
import TimePicker from 'antd/es/time-picker';
import DatePicker from 'antd/es/date-picker';
import Select from 'antd/es/select';
import dayjs from 'common';
import type { Dayjs } from 'common';
import { Spin } from '../../components/Spin';
import { ColProps } from 'antd/es/col';
import { type GameUpdateItem, GameSchema } from 'common/schema';
import { CreateForm, MutationReturn } from '../../lib/CRUD';
import { createSchemaFieldRule } from 'antd-zod';
import { UseMutationResult } from '@tanstack/react-query';
import { getZObject } from 'common';
import GameSystemSelect from './GameSystemSelect.js';
import GameTypeSelect from './GameTypeSelect.js';
import { Tooltip } from '../../components/Tooltip';
import { useBotMessage } from '../../components/BotMessage';
import type { GameForm } from './types.js';

const updateFormRule = createSchemaFieldRule(getZObject(GameSchema.update!).partial());

function FormItem<T>({ name, children, rules, ...rest }: { name: string, children: React.ReactNode } & Omit<FormItemProps<T>, 'name'>) {
    rules ||= []
    const { botMessage } = useBotMessage();
    const tooltip = `TOOLTIP_POST_GAME_${name.toUpperCase()}`;
    const message = botMessage(`LABEL_POST_GAME_${name.toUpperCase()}`);
    return (
        <Form.Item<T>
            {...rest}
            name={name as FormItemProps<T>['name']}
            label={<Tooltip messageKey={tooltip}>{message}</Tooltip>}
            rules={[updateFormRule, ...rules]}
        >
            {children}
        </Form.Item>
    );
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setDate = (val: Dayjs | undefined, date: Dayjs | undefined) => {
    if (!date || !val) return val;
    return val.year(date.year()).month(date.month()).date(date.date());
};

// Normalize value from component value before passing to Form instance.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const timeNormalize = (formRef: RefObject<FormInstance<GameForm>>, val: Dayjs | undefined): Dayjs | undefined => {
    if (!val || !formRef.current) return val;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const date = formRef.current.getFieldValue('date');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    if (!date?.isValid?.()) return val;
    return setDate(val, date as Dayjs);
};

const timeGetValue = (formRef: RefObject<FormInstance<GameForm>>, val: Dayjs | Date | undefined ): Record<string, unknown> => {
    if (!val) return { value: val };
    if (!formRef.current) return { value: dayjs(val) };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const date = formRef.current.getFieldValue('date');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    if (!date?.isValid?.()) return { value: dayjs(val) };
    return { value: setDate(dayjs(val), date as Dayjs) };
};

function TimeControl({
    formRef,
    save,
    disabled,
    name,
    labelCol,
    wrapperCol,
    style,
    rules
}: {
    formRef: RefObject<FormInstance<GameForm>>,
    save: () => void;
    disabled: boolean;
    name: string;
    labelCol?: ColProps;
    wrapperCol?: ColProps;
    style?: React.CSSProperties;
    rules?: Rule[];
}) {
    rules ||= [];
    return (
        <FormItem
            getValueProps={timeGetValue.bind(undefined, formRef)}
            normalize={timeNormalize.bind(undefined, formRef)}
            style={style}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            name={name}
            dependencies={['date']}
            rules={rules}
        >
            <TimePicker showNow={false} minuteStep={15} format={'HH:mm'} size="middle" onChange={save} disabled={disabled} />
        </FormItem>
    );
};

export default function PostGameForm({
    save,
    isLoading,
    mutation,
    initialValues,
    children,
    createForm = true,
    disabled = false,
    submitButtonText,
    formRef
}: {
    save: () => void;
    isLoading: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutation: UseMutationResult<MutationReturn<GameForm>, Error, GameForm, GameForm>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialValues: Record<string, any>;
    children?: React.ReactNode;
    createForm?: boolean;
    disabled?: boolean;
    submitButtonText?: string;
    formRef: RefObject<FormInstance<GameForm>>;
}) {
    children ||= <></>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any


    return (
        <div>
            {' '}
            <Spin spinning={isLoading} />
                <CreateForm
                    mutation={mutation}
                    initialValues={initialValues}
                    submitButton={!createForm}
                    submitButtonText={submitButtonText}
                    labelCol={{ span: 3 }}
                    wrapperCol={{ span: 21 }}
                    formRef={formRef}
                >
                    <Form.Item<GameUpdateItem> style={{ height: 0, margin: 0 }} name="key">
                        <Input type="hidden" />
                    </Form.Item>
                    <FormItem name="name">
                        <Input onPressEnter={save} onBlur={save} disabled={disabled} />
                    </FormItem>
                    <GameTypeSelect save={save} disabled={disabled || !createForm} />
                    <GameSystemSelect save={save} create={createForm} disabled={disabled || !createForm} />
                    <FormItem wrapperCol={{ style: { maxWidth: 275, textAlign: 'left' }, offset: 0, span: 20 }} name="date">
                        <DatePicker
                            style={{ width: '250px', paddingRight: '20px' }}
                            minDate={dayjs().add(1, 'day')}
                            format={'dddd D MMM (YYYY-MM-DD)'}
                            onChange={(newDate) => {
                                if (!formRef.current) return;
                                const starttime = setDate(formRef.current.getFieldValue('starttime') as Dayjs, newDate);
                                const endtime = setDate(formRef.current.getFieldValue('endtime') as Dayjs, newDate);
                                formRef.current.setFieldsValue({starttime, endtime});
                                save();
                                return;
                            }}
                            disabled={disabled}
                        />
                    </FormItem>
                    <TimeControl
                        formRef={formRef}
                        save={save}
                        disabled={disabled}
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, newStarttime) {
                                    const endtime = getFieldValue('endtime') as Dayjs | undefined;
                                    if (!newStarttime || !endtime) {
                                        return Promise.resolve();
                                    }
                                    if (setDate(endtime, newStarttime as Dayjs)!.isAfter(newStarttime as Dayjs)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The start time must be before the end time!'));
                                }
                            })
                        ]}
                        wrapperCol={{ style: { maxWidth: 150, textAlign: 'left' }, span: 19 }}
                        name="starttime"
                    />
                    <TimeControl
                        formRef={formRef}
                        save={save}
                        disabled={disabled}
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, newEndtime) {
                                    const starttime = getFieldValue('starttime') as Dayjs | undefined;
                                    if (!newEndtime || !starttime) {
                                        return Promise.resolve();
                                    }
                                    if (setDate(starttime, newEndtime as Dayjs)!.isBefore(newEndtime as Dayjs)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The end time must be after the start time!'));
                                }
                            })
                        ]}
                        wrapperCol={{ style: { maxWidth: 150, textAlign: 'left' }, span: 19 }}
                        name="endtime"
                    />
                    <FormItem name="location">
                        <Input onPressEnter={save} onBlur={save} disabled={disabled} />
                    </FormItem>
                    <FormItem name="description">
                        <Input.TextArea rows={6} size={'large'} onBlur={save} disabled={disabled} />
                    </FormItem>
                    <FormItem wrapperCol={{ style: { maxWidth: 100 }, span: 19 }} name="maxplayers">
                        <Select
                            options={Array.from({ length: 7 }, (_, i) => i + 1).map((idx) => {
                                return { value: idx, label: <span>{idx}</span> };
                            })}
                            onBlur={save}
                            disabled={disabled}
                        />
                    </FormItem>
                    {children}
                </CreateForm>
            
        </div>
    );
}
