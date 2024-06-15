<script setup>
import {reactive, ref} from "vue";
import axios from "axios";

const url = ref("https://api.lnpine.lol");
const Person = reactive({
  num:100,
  name: "小猫老弟",
  email: "xiaomao@gmail.com",
});
const Student = ref({
  sno:1,
  sname:"黄的见"
});
var ListData = ref(null);


  function DJ(){
    console.log(Person.num)
    console.log(Student.value.sno)

    let baseUrl= url.value;
    axios.get(baseUrl+"/user").then(res=>{
      //console.log(res.data.data);
      ListData.value = res.data;
      console.log(ListData)
    })

  }

</script>

<template>
<a-button @click="DJ" type="text">点击事件</a-button>
  <h5>{{url}}</h5>
  <span v-if="Person.num > 10">大于10显示 + {{Person.name}}</span>
  <p>{{Person.email}}</p>

  <div>{{ListData}}</div>

</template>

<style scoped>

</style>