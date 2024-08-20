<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './lib/supabaseClient'
// require('dotenv').config()

const groceries = ref([])

async function getGroceries() {
    const { data } = await supabase.from('groceries').select()
    groceries.value = data
}

onMounted(() => {
    getGroceries()
})
</script>

<template>
    <ul>
        <li v-for="grocery in groceries" :key="grocery.id">{{ grocery.name }}</li>
    </ul>
</template>