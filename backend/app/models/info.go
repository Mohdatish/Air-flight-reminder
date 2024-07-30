package models

type FlightInfo struct {
    Airline       string `json:"Airline"`
    FlightNumber  string `json:"FlightNumber"`
    Status        string `json:"Status"`
    OperatedBy    string `json:"Operated By"`
    DepartureTime string `json:"DepartureTime"`
    ArrivalTime   string `json:"ArrivalTime"`
}
