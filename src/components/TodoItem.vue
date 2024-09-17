<script lang="ts" setup>
	import { ref } from 'vue'

	const props = defineProps({
		label: { type: String, required: true },
		id: { type: String, required: true },
		isCompleted: { type: Boolean }
	})
	const emit = defineEmits([
		'checked',
		'deleteItem',
		'updateItem'
	])

	const isChecked = ref(props.isCompleted);
	const isEdit = ref(false);
	const title = ref(props.label);
	const update = () => {
		if(isEdit.value && title.value !== props.label) emit('updateItem', title, props.id);
		isEdit.value = !isEdit.value;
	}
</script>

<template>
	<li>
		<input type="checkbox" @click="$emit('checked', id)" v-model="isChecked" />
		<input type="text" v-if="isEdit" v-model="title"/>
		<label v-else>{{ label }}</label>
		<div class="btn-group">
			<button class="edit" @click="update">{{ isEdit ? "Save" : "Edit" }}</button>
			<button class="delete" @click="$emit('deleteItem', id)">Delete</button>
		</div>
	</li>
</template>
<style scoped>

li {
	overflow: hidden;
	padding: 20px 0;
	border-bottom: 1px solid #eee;
	display: flex;
}

li > input[type="checkbox"] {
	margin: 0 10px;
}

li > label {
	font-size: 18px;
	line-height: 40px;
	width: 237px;
}

li > .delete:hover {
	color: #CF2323;
}

li > .btn-group {
	width: 140px;
}

/* Completed */

#completed-tasks label {
	text-decoration: line-through;
	color: #888;
}

</style>