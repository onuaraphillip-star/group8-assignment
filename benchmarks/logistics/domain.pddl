(define (domain logistics)
  (:requirements :strips :typing)
  (:types 
    package vehicle location city - object
    airport - location
    truck airplane - vehicle)
  
  (:predicates
    (at ?obj - object ?loc - location)
    (in-city ?loc - location ?city - city)
    (in ?pkg - package ?veh - vehicle))
  
  ; Drive truck between locations in the same city
  (:action drive
    :parameters (?truck - truck ?from ?to - location ?city - city)
    :precondition (and 
      (at ?truck ?from)
      (in-city ?from ?city)
      (in-city ?to ?city))
    :effect (and 
      (at ?truck ?to)
      (not (at ?truck ?from))))
  
  ; Fly airplane between airports
  (:action fly
    :parameters (?plane - airplane ?from ?to - airport)
    :precondition (and 
      (at ?plane ?from))
    :effect (and 
      (at ?plane ?to)
      (not (at ?plane ?from))))
  
  ; Load package onto truck at location
  (:action load-truck
    :parameters (?pkg - package ?truck - truck ?loc - location)
    :precondition (and 
      (at ?pkg ?loc)
      (at ?truck ?loc))
    :effect (and 
      (in ?pkg ?truck)
      (not (at ?pkg ?loc))))
  
  ; Load package onto airplane at airport
  (:action load-airplane
    :parameters (?pkg - package ?plane - airplane ?loc - airport)
    :precondition (and 
      (at ?pkg ?loc)
      (at ?plane ?loc))
    :effect (and 
      (in ?pkg ?plane)
      (not (at ?pkg ?loc))))
  
  ; Unload package from truck
  (:action unload-truck
    :parameters (?pkg - package ?truck - truck ?loc - location)
    :precondition (and 
      (in ?pkg ?truck)
      (at ?truck ?loc))
    :effect (and 
      (at ?pkg ?loc)
      (not (in ?pkg ?truck))))
  
  ; Unload package from airplane
  (:action unload-airplane
    :parameters (?pkg - package ?plane - airplane ?loc - airport)
    :precondition (and 
      (in ?pkg ?plane)
      (at ?plane ?loc))
    :effect (and 
      (at ?pkg ?loc)
      (not (in ?pkg ?plane))))
)
