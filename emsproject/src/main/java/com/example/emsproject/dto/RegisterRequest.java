package com.example.emsproject.dto;

import com.example.emsproject.entity.Role;

public record RegisterRequest(String email, String password , Role role) {}