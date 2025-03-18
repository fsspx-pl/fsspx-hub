/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import configPromise from '@payload-config'
import '@payloadcms/next/css'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import React from 'react'
import type { ServerFunctionClient } from 'payload'
import config from '@payload-config'
import { importMap } from './admin/importMap'

import './custom.scss'

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
   'use server'
   return handleServerFunctions({
     ...args,
     config,
     importMap,
   })
}

const Layout = ({ children }: Args) => <RootLayout importMap={importMap} serverFunction={serverFunction} config={configPromise}>{children}</RootLayout>

export default Layout
