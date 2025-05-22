"use client"

import { useState } from "react"

interface ToastProps {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

// Simple toast implementation for our needs
export function toast(props: ToastProps) {
  alert(`${props.title}: ${props.description || ""}`)
  console.log(props)
  return props
} 