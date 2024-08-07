import { type RefObject } from 'react';
import Form, { FormInstance, Rule, type FormItemProps } from 'antd/es/form';
import { NamePath } from 'rc-field-form/es/interface.js';
import Input from 'antd/es/input';
import TimePicker from 'antd/es/time-picker';
import DatePicker from 'antd/es/date-picker';
import Select from 'antd/es/select';
import dayjs from '../dayjs.js';
import Spin from 'antd/es/spin';
import { ColProps } from 'antd/es/col';
import { type GameUpdateItem, GameSchema, type GameCreateItem } from 'common/schema';
import { CreateForm } from '../CRUD.js';
import { createSchemaFieldRule } from 'antd-zod';
import { UseMutationResult } from '@tanstack/react-query';
import { getZObject } from 'common';
import GameSystemSelect from './GameSystemSelect.js';
import GameTypeSelect from './GameTypeSelect.js';

const updateFormRule = createSchemaFieldRule(getZObject(GameSchema.update!).partial());

export default function PostGameForm({
	save,
	setIsCreating,
	isLoading,
	mutation,
	initialValues,
	children = <></>,
	createForm = true,
	disabled = false,
	submitButtonText,
	formRef
}: {
	setIsCreating: React.Dispatch<React.SetStateAction<boolean>>;
	save: () => void;
	isLoading: boolean;
	mutation: UseMutationResult<void, Error, any, void>;
	initialValues: { [key: string]: any };
	children?: React.ReactNode;
	createForm?: boolean;
	disabled?: boolean;
	submitButtonText?: string;
	formRef: RefObject<FormInstance<GameCreateItem>>;
}) {
	const FormItem = ({ name, label, children, rules = [], ...rest }: { children: React.ReactNode } & FormItemProps) => {
		return (
			<Form.Item<GameCreateItem> {...rest} name={name} label={label} rules={[updateFormRule, ...rules]}>
				{children}
			</Form.Item>
		);
	};

	const setDate = (val: any, date: any) => {
		if (!date || !val) return val;
		return val.year(date.year()).month(date.month()).date(date.date());
	};

	// Normalize value from component value before passing to Form instance.
	const timeNormalize = (val: any): any => {
		if (!val || !formRef.current) return val;
		const date = formRef.current?.getFieldValue('date');
		if (!date || !date.isValid || !date.isValid()) return val;
		return setDate(val, date);
	};
	const timeGetValue = (val: any): any => {
		if (!val) return val;
		if (!formRef.current) return { value: dayjs(val) };
		const date = formRef.current?.getFieldValue('date');
		if (!date || !date.isValid || !date.isValid()) return { value: dayjs(val) };
		return { value: setDate(dayjs(val), date) };
	};

	const TimeControl = ({
		name,
		label,
		labelCol,
		wrapperCol,
		style,
		rules = []
	}: {
		name: NamePath<GameUpdateItem>;
		label: string;
		labelCol?: ColProps;
		wrapperCol?: ColProps;
		style?: React.CSSProperties;
		rules?: Rule[];
	}) => {
		return (
			<FormItem
				getValueProps={timeGetValue}
				normalize={timeNormalize}
				style={style}
				labelCol={labelCol}
				wrapperCol={wrapperCol}
				name={name}
				label={label}
				dependencies={['date']}
				rules={rules}
			>
				<TimePicker showNow={false} minuteStep={15} format={'HH:mm'} size="middle" onChange={save} disabled={disabled} />
			</FormItem>
		);
	};
	return (
		<div>
			{' '}
			<Spin spinning={isLoading} fullscreen />
			{initialValues ? (
				<CreateForm<GameCreateItem & { date?: any }>
					mutation={mutation}
					setIsMutating={setIsCreating}
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
					<FormItem label="Name" name="name">
						<Input onPressEnter={save} onBlur={save} disabled={disabled} />
					</FormItem>
					<GameTypeSelect save={save} disabled={disabled || !createForm} />
					<GameSystemSelect save={save} create={createForm} disabled={disabled || !createForm} />
					<FormItem wrapperCol={{ style: { maxWidth: 275, textAlign: 'left' }, offset: 0, span: 20 }} name="date" label="Date">
						<DatePicker
							style={{ width: '250px', paddingRight: '20px' }}
							minDate={dayjs().add(1, 'day')}
							format={'dddd D MMM (YYYY-MM-DD)'}
							onChange={(val) => {
								if (val) {
									formRef.current?.setFieldValue('starttime', setDate(formRef.current?.getFieldValue('starttime'), val));
									formRef.current?.setFieldValue('endtime', setDate(formRef.current?.getFieldValue('endtime'), val));
									save();
								}
							}}
							disabled={disabled}
						/>
					</FormItem>
					<TimeControl
						rules={[
							({ getFieldValue }) => ({
								validator(_, value) {
									const endtime = getFieldValue('endtime');
									if (!value || !endtime || endtime.isAfter(value)) {
										return Promise.resolve();
									}
									return Promise.reject(new Error('The start time must be before the end time!'));
								}
							})
						]}
						wrapperCol={{ style: { maxWidth: 150, textAlign: 'left' }, span: 19 }}
						name="starttime"
						label="Start Time"
					/>
					<TimeControl
						rules={[
							({ getFieldValue }) => ({
								validator(_, value) {
									const starttime = getFieldValue('starttime');
									if (!value || !starttime || starttime.isBefore(value)) {
										return Promise.resolve();
									}
									console.log('INVALID endTIme');
									return Promise.reject(new Error('The end time must be after the start time!'));
								}
							})
						]}
						wrapperCol={{ style: { maxWidth: 150, textAlign: 'left' }, span: 19 }}
						name="endtime"
						label="End Time"
					/>
					<FormItem label="Location" name="location">
						<Input onPressEnter={save} onBlur={save} disabled={disabled} />
					</FormItem>
					<FormItem label="Description" name="description">
						<Input.TextArea rows={6} size={'large'} onBlur={save} disabled={disabled} />
					</FormItem>
					<FormItem wrapperCol={{ style: { maxWidth: 100 }, span: 19 }} label="Max Players" name="maxplayers">
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
			) : (
				<></>
			)}
		</div>
	);
}
