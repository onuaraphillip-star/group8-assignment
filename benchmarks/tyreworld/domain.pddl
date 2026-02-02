(define (domain tyreworld)
  (:requirements :strips :typing)
  (:types 
    location tool container - object
    wheel nut - object)
  
  (:predicates
    (at ?obj - object ?loc - location)
    (in ?obj - object ?cont - container)
    (on-vehicle ?wheel - wheel)
    (loose ?nut - nut)
    (tight ?nut - nut)
    (removed ?wheel - wheel)
    (have ?tool - tool)
    (holding ?wheel - wheel)
    (jacked-up ?loc - location)
    (flat ?wheel - wheel)
    (inflated ?wheel - wheel))
  
  ; Open container
  (:action open
    :parameters (?cont - container)
    :precondition (not (have ?cont))
    :effect (have ?cont))
  
  ; Close container
  (:action close
    :parameters (?cont - container)
    :precondition (have ?cont)
    :effect (not (have ?cont)))
  
  ; Fetch tool from container
  (:action fetch-tool
    :parameters (?tool - tool ?cont - container)
    :precondition (and 
      (have ?cont)
      (in ?tool ?cont))
    :effect (and 
      (have ?tool)
      (not (in ?tool ?cont))))
  
  ; Put tool back in container
  (:action put-away-tool
    :parameters (?tool - tool ?cont - container)
    :precondition (and 
      (have ?cont)
      (have ?tool))
    :effect (and 
      (in ?tool ?cont)
      (not (have ?tool))))
  
  ; Fetch wheel from container
  (:action fetch-wheel
    :parameters (?wheel - wheel ?cont - container)
    :precondition (and 
      (have ?cont)
      (in ?wheel ?cont))
    :effect (and 
      (holding ?wheel)
      (not (in ?wheel ?cont))))
  
  ; Put wheel in container
  (:action put-away-wheel
    :parameters (?wheel - wheel ?cont - container)
    :precondition (and 
      (have ?cont)
      (holding ?wheel))
    :effect (and 
      (in ?wheel ?cont)
      (not (holding ?wheel))))
  
  ; Loosen nut with wrench
  (:action loosen
    :parameters (?nut - nut ?wrench - tool ?loc - location)
    :precondition (and 
      (have ?wrench)
      (tight ?nut)
      (at ?nut ?loc))
    :effect (and 
      (loose ?nut)
      (not (tight ?nut))))
  
  ; Tighten nut with wrench
  (:action tighten
    :parameters (?nut - nut ?wrench - tool ?loc - location)
    :precondition (and 
      (have ?wrench)
      (loose ?nut)
      (at ?nut ?loc))
    :effect (and 
      (tight ?nut)
      (not (loose ?nut))))
  
  ; Jack up the vehicle at location
  (:action jack-up
    :parameters (?loc - location ?jack - tool)
    :precondition (and 
      (have ?jack)
      (not (jacked-up ?loc)))
    :effect (jacked-up ?loc))
  
  ; Jack down the vehicle
  (:action jack-down
    :parameters (?loc - location ?jack - tool)
    :precondition (and 
      (have ?jack)
      (jacked-up ?loc))
    :effect (not (jacked-up ?loc)))
  
  ; Remove wheel from vehicle
  (:action remove-wheel
    :parameters (?wheel - wheel ?nut - nut ?loc - location)
    :precondition (and 
      (jacked-up ?loc)
      (loose ?nut)
      (on-vehicle ?wheel)
      (at ?nut ?loc))
    :effect (and 
      (removed ?wheel)
      (holding ?wheel)
      (not (on-vehicle ?wheel))
      (not (at ?wheel ?loc))))
  
  ; Put wheel on vehicle
  (:action put-on-wheel
    :parameters (?wheel - wheel ?nut - nut ?loc - location)
    :precondition (and 
      (jacked-up ?loc)
      (loose ?nut)
      (holding ?wheel)
      (at ?nut ?loc))
    :effect (and 
      (on-vehicle ?wheel)
      (not (holding ?wheel))
      (at ?wheel ?loc)))
  
  ; Inflate wheel with pump
  (:action inflate
    :parameters (?wheel - wheel ?pump - tool)
    :precondition (and 
      (have ?pump)
      (flat ?wheel))
    :effect (and 
      (inflated ?wheel)
      (not (flat ?wheel))))
)
