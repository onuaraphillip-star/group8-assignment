(define (problem logistics-simple)
  (:domain logistics)
  (:objects
    city-a city-b - city
    truck-a truck-b - truck
    plane-a - airplane
    package1 package2 - package
    loc-a loc-b - location
    airport-a airport-b - airport)
  (:init
    ; Cities and locations
    (in-city loc-a city-a)
    (in-city airport-a city-a)
    (in-city loc-b city-b)
    (in-city airport-b city-b)
    
    ; Truck at location in city-a
    (at truck-a loc-a)
    
    ; Truck at airport in city-b
    (at truck-b airport-b)
    
    ; Plane at airport in city-a
    (at plane-a airport-a)
    
    ; Packages at loc-a
    (at package1 loc-a)
    (at package2 loc-a))
  
  (:goal (and
    (at package1 loc-b)
    (at package2 loc-b))))
