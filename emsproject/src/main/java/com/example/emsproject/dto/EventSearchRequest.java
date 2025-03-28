package com.example.emsproject.dto;
import com.example.emsproject.entity.EventCategory;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventSearchRequest {
    private EventCategory category;
    private LocalDateTime fromDate;
}