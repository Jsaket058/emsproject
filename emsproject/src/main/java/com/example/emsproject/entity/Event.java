package com.example.emsproject.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    @Enumerated(EnumType.STRING)
    private EventCategory category;

    private LocalDateTime dateTime;
    private int maxSlots;
    private int availableSlots;
    private boolean isCancelled;

    @ManyToOne
    @JoinColumn(name = "organizer_id")
    private User organizer;

    @Column(nullable = false)
    private boolean isClosed = false;

}