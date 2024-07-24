import { useState, createRef } from 'react';
import { FormRef } from 'rc-field-form/es/interface.js';
import { useParams } from 'react-router-dom';
import { type GameListItem, type GameSessionUserSignupDelete, GameSchema } from 'common/schema';
import { getFetchQuery, getUpdateMutation } from '../CRUD.js';
import { getZObject } from 'common';
import dayjs from 'dayjs';
import PostGameForm from './PostGameForm.js';
import Table from 'antd/es/table';
import { type DefaultColumns } from '../CRUD.js';
import FindUserSearchBox from './FindUser.js';
import Typeography from 'antd/es/typography';
import UserRecord, { type AutoCompleteUser } from './UserRecord.js';
import { DeleteOutlined } from '@ant-design/icons';
import { fetch, FetchResultTypes, FetchMethods } from '@sapphire/fetch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import NotFound from '../NotFound.js';

const Title = Typeography.Title;

function UsersSignedUpTable({
	deleteDisabled,
	gameSessionKey,
	users
}: {
	deleteDisabled: boolean;
	gameSessionKey: number;
	users: AutoCompleteUser[];
}) {
	const queryClient = useQueryClient();
	const removeUserFromGameMutation = useMutation({
		mutationFn: (r: GameSessionUserSignupDelete) => {
			return fetch(
				'/api/gamesessionusersignups',
				{
					method: FetchMethods.Delete,
					body: JSON.stringify(r),
					headers: {
						'Content-Type': 'application/json'
					}
				},
				FetchResultTypes.JSON
			).then((data) => {
				queryClient.invalidateQueries({ queryKey: ['gamesessions', `${r.gameSessionKey}`] });
				return data;
			});
		}
	});
	const columns: DefaultColumns = [
		{
			title: 'Name',
			dataIndex: 'nickname',
			key: 'nickname',
			render: (_, record) => {
				console.log(record);
				return <UserRecord user={record as AutoCompleteUser} />;
			}
		}
	];
	if (!deleteDisabled) {
		columns.push({
			title: 'Delete',
			dataIndex: 'delete',
			key: 'delete',
			render: (_, record) => {
				return (
					<DeleteOutlined
						onClick={() => {
							removeUserFromGameMutation.mutate({ userKey: record.key, gameSessionKey });
						}}
					/>
				);
			}
		});
	}
	return (
		<>
			<Title>Signed up Players</Title>
			<Table dataSource={users} columns={columns} />
		</>
	);
}

export default function ViewGame() {
	const findSchema = GameSchema.find!;
	const { data, error } = findSchema.safeParse(useParams());
	if (error) {
		return <NotFound />;
	}
	const key = data.key as number;
	const queryKey = ['gamesessions', key];
	console.log('Query game session key: ', ['gamesessions', `${key}`]);
	const result = getFetchQuery<GameListItem>(`/api/gamesessions/${key}`, queryKey);

	const save = () => {};
	const formRef = createRef<FormRef>();
	const [isCreating, setIsCreating] = useState(false);
	const updateMutation = getUpdateMutation(`/api/gamesessions`, ['gamesessions', key], setIsCreating, () => {
		console.log('updated');
	});

	if (!result.data) {
		return <div>loading</div>;
	}
	// FIXME - clean this up
	const res = getZObject(GameSchema.read).partial().safeParse(result.data);
	const initialValues = res.data!;
	initialValues.date = initialValues.starttime.clone().hour(12).minute(0).second(0).millisecond(0);
	const now = dayjs(Date.now());
	const editable = initialValues.starttime > now;
	const signedUpUsers: AutoCompleteUser[] = initialValues.signedupplayers;
	const full = initialValues.maxplayers <= signedUpUsers.length;
	return (
		<div>
			This page will contain the details / ability to edit things about an existing game you have already posted, and saving edits will update
			the Discord listings
			<PostGameForm
				mutation={updateMutation}
				initialvalues={initialValues}
				isLoading={isCreating || result.isFetching}
				formRef={formRef}
				save={save}
				setIsCreating={setIsCreating}
				createForm={false}
				disabled={!editable}
			/>
			<UsersSignedUpTable deleteDisabled={!editable} gameSessionKey={key} users={signedUpUsers} />
			{editable ? (
				<>
					Add user:&nbsp;
					<FindUserSearchBox
						disabled={full}
						gameSessionKey={key}
						exclude={res.data!.signedupplayers.map((player: AutoCompleteUser) => player.key)}
					/>
				</>
			) : (
				<></>
			)}
		</div>
	);
}
