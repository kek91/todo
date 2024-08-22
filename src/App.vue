<template>

    <Login
            v-if="!user"
            @login="loginUser"
            msg="Hello, world!"
    />

<!--    <p>User:</p>-->
<!--    <div v-html="user.value"></div>-->


    <div v-if="showTodoList">
        <h1>{{ currentTodoList.name }}</h1>
        <p>{{ currentTodoList.description }}</p>
        <p>Config: <pre>{{ currentTodoList.config }}</pre></p>

        <br><br>

        <table>
            <tr>
                <th>Name</th>
                <th>Qty</th>
                <th>Done</th>
            </tr>
            <tr v-for="entry in currentTodoEntries" :key="entry.id">
                <td>{{ entry.name }}</td>
                <td>{{ entry.qty }}</td>
                <td>{{ entry.done }}</td>
            </tr>
        </table>

        <br><br>

        <button type="button" @click="showTodoList = false">&raquo; Back to my Todo lists</button>

    </div>


    <div v-else>
        <h1>My Todo lists</h1>
        <table>
            <tr>
                <th>ID</th>
                <th>Created</th>
                <th>Name</th>
                <th>Description</th>
                <th>Config</th>
                <th>Owner</th>
            </tr>
            <tr v-for="todoList in myTodoLists" :key="todoList.id" @click="openTodoList(todoList)" :style="`background-color:${rowColor(todoList.config)};`">
                <td>{{ todoList.id }}</td>
                <td>{{ todoList.created_at }}</td>
                <td>{{ todoList.name }}</td>
                <td>{{ todoList.description }}</td>
                <td>{{ todoList.config }}</td>
                <td>{{ todoList.owner }}</td>
            </tr>
        </table>
    </div>

</template>

<style>
table th {
    font-weight:bold;
    border-bottom:1px solid #333;
}
table td {
    padding:10px;
    border-bottom:1px solid dodgerblue;
    cursor:pointer;
}
table tr:hover {
    background-color:rgba(0,0,0,0.02) !important;
}
button {
    padding:10px;
    font-weight:bold;
    cursor:pointer;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './lib/supabaseClient'
import Login from "@/components/Login.vue";

const myTodoLists = ref([]);
let showTodoList = ref(false)
let currentTodoList = ref();
let currentTodoEntries = ref([]);
const user = ref();

async function fetchTodoLists() {
    const { data } = await supabase.from('todolists').select();
    myTodoLists.value = data;
}

async function fetchEntriesInTodolist(todoListId) {
    const { data } = await supabase.from('todoentries').select().eq('todolist_id', todoListId);
    currentTodoEntries.value = data;
}

async function openTodoList(todoList) {
    console.log('openTodoList', todoList.id)
    showTodoList.value = true;
    currentTodoList.value = todoList;
    await fetchEntriesInTodolist(todoList.id);
}

function rowColor(config) {
    switch (config.color) {
        case 'red':
            return '#FFCCCC';
        case 'green':
            return '#CCFFCC';
        case 'blue':
            return '#CCFFFF';
        case 'yellow':
            return '#FFFFCC';
        default:
            return '#CCCCCC';
    }
}


onMounted(() => {
    fetchTodoLists();

    user.value = null;
    supabase.auth.getUser().then((auth) => {

        if (auth.data.user === null || auth.error.status === 400) {
            console.log("Not logged in!");
            user.value = null;
        } else {
            console.log("Logged in as user ", auth.data.user);
            user.value = auth.data.user;
        }
    });

});

</script>