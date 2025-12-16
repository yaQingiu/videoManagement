<template>
    <div>
        <el-result
        icon="error"
        title="Error"
        sub-title="404 Not Found">
        <template #extra>
          <el-button type="primary" @click="$router.push('/')">Back</el-button>
        </template>
      </el-result>
    </div>
</template>
<script></script>
<style scoped>

</style>