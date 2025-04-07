package com.example.emsproject.repository;
import com.example.emsproject.entity.Event;
import com.example.emsproject.entity.EventCategory;
import com.example.emsproject.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByOrganizerId(Long organizerId);

    List<Event> findByIsCancelledFalse();

    Optional<Event> findByIdAndOrganizer(Long eventId, User organizer);

    List<Event> findByCategory(EventCategory category);

    @Query("SELECT e FROM Event e WHERE :category IS NULL OR e.category = :category")
    List<Event> findByCategoryNullable(@Param("category") EventCategory category);
}
