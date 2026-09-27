<script setup lang="ts">
import { ref } from "vue";
import VuThemeProvider from "@velkin/vue/theme-provider";
import VuAppbar from "@velkin/vue/appbar";
import VuNavPanel from "@velkin/vue/nav-panel";
import VuThemeSwitcher from "@velkin/vue/theme-switcher";
import VuForm from "@velkin/vue/form";
import VuInput from "@velkin/vue/input";
import VuCheckbox from "@velkin/vue/checkbox";
import VuButton from "@velkin/vue/button";
import VuAlert from "@velkin/vue/alert";
import VuDialog from "@velkin/vue/dialog";

const navItems = [
  { key: "home", label: "Home", icon: "ion:home-outline" },
  { key: "settings", label: "Settings", icon: "ion:settings-outline" },
];

const page = ref("home");
const error = ref<string | null>(null);
const open = ref(false);

function onNavChange(e: CustomEvent<{ value?: string }>) {
  page.value = String(e.detail.value ?? "");
}

function onSubmit(e: Event) {
  e.preventDefault();
  error.value = null;
  open.value = true;
}
</script>

<template>
  <VuThemeProvider persist>
    <VuAppbar>
      <span slot="start">Velkin starter</span>
      <VuThemeSwitcher slot="end" type="button" variant="ghost" size="sm" />
    </VuAppbar>
    <div class="vu-dashboard">
      <VuNavPanel :items="navItems" :value="page" @vu-change="onNavChange" />
      <main class="vu-dashboard__main">
        <VuForm @vu-submit="onSubmit">
          <VuAlert
            v-if="error"
            color="danger"
            variant="soft"
            heading="Sign in failed"
            :message="error"
          />
          <VuInput label="Email" type="email" name="email" required />
          <VuInput label="Password" type="password" name="password" required />
          <VuCheckbox name="remember">Remember me</VuCheckbox>
          <VuButton type="submit" color="primary">Sign in</VuButton>
        </VuForm>
        <VuButton variant="ghost" @click="error = 'Invalid credentials'">Simulate error</VuButton>
      </main>
    </div>
    <VuDialog :open="open" @vu-close="open = false">
      <div slot="header">Welcome</div>
      <div slot="body">You are signed in (demo).</div>
      <div slot="footer">
        <VuButton @click="open = false">OK</VuButton>
      </div>
    </VuDialog>
  </VuThemeProvider>
</template>
