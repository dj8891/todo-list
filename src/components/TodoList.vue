<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { generateClient } from "aws-amplify/api";
import TodoItem from './TodoItem.vue';
import { createTodo, deleteTodo, updateTodo } from './../graphql/mutations';
import { listTodos } from '../graphql/queries';
import { onCreateTodo, onUpdateTodo, onDeleteTodo } from '../graphql/subscriptions';
const client = generateClient();

interface TodoProps {
	title: string;
	isCompleted: boolean;
	id: string;
}
const title = ref("");
const isCompleted = ref(false);
let todoList = reactive<TodoProps[]>([]);
const completedTodos = computed(() => todoList.filter(item => item.isCompleted));
const incompletedTodos = computed(() => todoList.filter(item => !item.isCompleted));
const fetchTodos = async () => {
	const response = await client.graphql({
		query: listTodos
	});
	
	if(response.data && response.data.listTodos) {
		todoList.splice(0, todoList.length, ...response.data.listTodos.items);
	}
}

const createTodoFunc = async () => {

	// check if item name is empty
	if(!title.value) return;

	// check if item name is duplicated
	if(todoList.find(item => item.title === title.value)) return;

	const todo = { title: title.value, isCompleted: false };
	const response = await client.graphql({
		query: createTodo,
		variables: { input: todo },
	});
	
	todoList.push(response.data.createTodo);
	title.value = "";
	isCompleted.value = false;
	console.log("this is todoList", todoList)
}

const checkedComplete = async (id: string) => {
	const item= todoList.find(item => item.id === id);
	if(item) {
		item.isCompleted = !item.isCompleted;
		const {id, title, isCompleted} = item;
		await client.graphql({
			query: updateTodo,
			variables: { input: { id, title, isCompleted } },
		});

	}
	else console.warn(`Item with id ${id} not found`)
}

const deleteItem = async (id: string) => {
	const response = await client.graphql({
		query: deleteTodo,
		variables: { input: { id } },
	});
	if(response.data.deleteTodo) {
		const index = todoList.findIndex(item => item.id === id)
		todoList.splice(index, 1);
	}
}

const updateItem = async (updatedTitle: string, id: string) => {
	const item = todoList.find(ele => ele.id === id);
	if(item) {
		item.title = updatedTitle;
		const {id, title, isCompleted} = item;
		await client.graphql({
			query: updateTodo,
			variables: { input: { id, title, isCompleted } },
		});
	}
	else console.warn(`Item with id ${id} not found`)
}

const handleUpate = (updatedItem: TodoProps) => {
	const index = todoList.findIndex(item => item.id === updatedItem.id);
	if(index !== -1) todoList.splice(index, 1, updatedItem);
	else todoList.push(updatedItem);
}

const handleSubscription = () => {
	const createSub = client.graphql({
		query: onCreateTodo
	}).subscribe({
		next: ({ data }) => {
			handleUpate(data.onCreateTodo);
		},
		error: error => console.error("Create subscription error", error)
	})

	const updateSub = client.graphql({
		query: onUpdateTodo
	}).subscribe({
		next: ({ data }) => {
			handleUpate(data.onUpdateTodo);
		},
		error: error => console.error("Update subscription error", error)
	})

	const deleteSub = client.graphql({
		query: onDeleteTodo
	}).subscribe({
		next: ({ data }) => {
			const index = todoList.findIndex(item => item.id === data.onDeleteTodo.id);
			if(index !== -1) todoList.splice(index, 1);
		}
	})

	return { createSub, updateSub, deleteSub };
}

const subscriptions = handleSubscription();
onMounted(() => {
	fetchTodos();
	handleSubscription();
});

onUnmounted(() => {
	subscriptions.createSub.unsubscribe();
	subscriptions.updateSub.unsubscribe();
	subscriptions.deleteSub.unsubscribe();
}) ;
</script>

<template>
	<amplify-authenticator>
		<div class="container">
			<h2>TODO LIST</h2>
			<h3>Add Item</h3>
			<p>
				<input id="new-task" type="text" v-model="title" required><button @click="createTodoFunc">Add</button>
			</p>
			<h3>Todo</h3>
			<ul id="incomplete-tasks">
				<todo-item 
					v-for="item in incompletedTodos" 
					:label="item.title" 
					:id="item.id" 
					:isCompleted="item.isCompleted" 
					@checked="checkedComplete"
					@updateItem="updateItem"
					@deleteItem="deleteItem"></todo-item>
			</ul>
			<h3>Completed</h3>
			<ul id="completed-tasks">
				<todo-item 
					v-for="item in completedTodos" 
					:label="item.title" 
					:id="item.id" 
					:isCompleted="item.isCompleted" 
					@checked="checkedComplete"
					@updateItem="updateItem"
					@deleteItem="deleteItem"></todo-item>
			</ul>
		</div>
	</amplify-authenticator>
</template>

<style scoped>

.container {
	display: block;
	width: 450px;
	margin: 10px auto 100px;
	background-color:#fff;
	padding:0px 10px 10px 10px;
	border-radius:10px
}



/* Heading */

h3,
label[for='new-task'] {
	color: #333;
	font-weight: 700;
	font-size: 15px;
	border-bottom: 2px solid #333;
	padding: 20px 0 10px;
	margin: 0;
	text-transform: uppercase;
}


/* New Task */

label[for='new-task'] {
	display: block;
	margin: 0 0 20px;
}

input#new-task {
	float: left;
	width: 295px;
	margin-left: 50px;
	margin-right: 5px;
}

p > button:hover {
	color: #0FC57C;
}

</style>