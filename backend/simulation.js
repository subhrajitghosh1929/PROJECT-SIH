/**
 * TransitMate Real-Time Simulation Engine (SIH Hackathon Engine)
 * 
 * Simulates real-world Kolkata transit corridor vehicles (Bus & Metro),
 * live GPS coordinates, dynamic stops away, ETA to board, approach progress,
 * and coach-by-coach crowd occupancy.
 */

class SimulationEngine {
  constructor() {
    this.vehicles = {
      home: {
        tripKey: "home",
        routeLabel: "Route 12",
        vehicleType: "bus",
        vehicleId: "WB-04-E-1289",
        phase: "waiting", // "waiting", "boarded", "arrived"
        waitProgress: 15,
        tripProgress: 0,
        currentStop: "Approaching Karunamoyee",
        stopsAway: 2,
        etaToBoardMin: 4,
        speedKmH: 26,
        crowdLevel: "High",
        stops: ["Sector V Bus Stand", "Karunamoyee", "Tank No. 4", "Nicco Park Gate"],
        coachCrowds: ["High", "High", "Medium"], // Front, Middle, Back
        delayMin: 0,
      },
      office: {
        tripKey: "office",
        routeLabel: "Metro · Blue",
        vehicleType: "metro",
        vehicleId: "KMRCL-TRAIN-04",
        phase: "waiting",
        waitProgress: 35,
        tripProgress: 0,
        currentStop: "Approaching Sector V Platform",
        stopsAway: 1,
        etaToBoardMin: 3,
        speedKmH: 48,
        crowdLevel: "Medium",
        stops: ["Sector V", "City Centre", "Bidhannagar", "Phoolbagan", "Park Street"],
        coachCrowds: ["Medium", "High", "Low", "Medium", "Low", "Medium"], // Coaches 1 to 6
        delayMin: 0,
      },
      esplanade: {
        tripKey: "esplanade",
        routeLabel: "Route 47",
        vehicleType: "bus",
        vehicleId: "WB-02-B-4712",
        phase: "waiting",
        waitProgress: 20,
        tripProgress: 0,
        currentStop: "Leaving Karunamoyee",
        stopsAway: 1,
        etaToBoardMin: 6,
        speedKmH: 22,
        crowdLevel: "Medium",
        stops: ["Sector V", "Karunamoyee", "Esplanade"],
        coachCrowds: ["Medium", "Medium", "Low"],
        delayMin: 0,
      },
      default: {
        tripKey: "default",
        routeLabel: "Route 15",
        vehicleType: "bus",
        vehicleId: "WB-01-A-1502",
        phase: "waiting",
        waitProgress: 10,
        tripProgress: 0,
        currentStop: "Approaching Karunamoyee",
        stopsAway: 2,
        etaToBoardMin: 5,
        speedKmH: 25,
        crowdLevel: "Medium",
        stops: ["Sector V", "Karunamoyee", "Baguiati", "City Centre", "Your stop"],
        coachCrowds: ["Medium", "Medium", "Low"],
        delayMin: 0,
      },
    };

    this.io = null;
    this.interval = null;
  }

  init(io) {
    this.io = io;
    this.startSimulationLoop();
    console.log("[SimulationEngine] Kolkata Transit Realtime Simulation started.");
  }

  startSimulationLoop() {
    if (this.interval) clearInterval(this.interval);

    this.interval = setInterval(() => {
      this.tick();
    }, 2500); // Ticks every 2.5 seconds
  }

  tick() {
    Object.keys(this.vehicles).forEach((key) => {
      const v = this.vehicles[key];

      if (v.phase === "waiting") {
        // Vehicle is approaching passenger stop
        v.waitProgress += 3.5;
        if (v.waitProgress >= 100) {
          v.waitProgress = 100;
          v.stopsAway = 0;
          v.etaToBoardMin = 0;
          v.currentStop = "At your stop (Sector V)";
          
          // Auto switch to boarded after passenger gets in
          setTimeout(() => {
            if (v.waitProgress >= 100) {
              v.phase = "boarded";
              v.tripProgress = 5;
            }
          }, 3000);
        } else {
          v.stopsAway = Math.max(0, Math.round(2 * (1 - v.waitProgress / 100)));
          v.etaToBoardMin = Math.max(1, Math.round(6 * (1 - v.waitProgress / 100))) + v.delayMin;
        }
      } else if (v.phase === "boarded") {
        // Vehicle is moving along route to final destination
        v.tripProgress += 3.0;
        const stopIdx = Math.min(v.stops.length - 1, Math.floor((v.tripProgress / 100) * v.stops.length));
        v.currentStop = `Near ${v.stops[stopIdx]}`;

        if (v.tripProgress >= 100) {
          v.tripProgress = 100;
          v.phase = "arrived";
          v.currentStop = `Arrived at ${v.stops[v.stops.length - 1]}`;

          // Reset cycle after 8 seconds for continuous demo capability
          setTimeout(() => {
            this.resetVehicle(key);
          }, 8000);
        }
      }

      // Dynamic minor crowd fluctuation to simulate live IoT sensors / boarding
      if (Math.random() < 0.15 && v.vehicleType === "metro") {
        const coachIdx = Math.floor(Math.random() * v.coachCrowds.length);
        const options = ["Low", "Medium", "High"];
        v.coachCrowds[coachIdx] = options[Math.floor(Math.random() * options.length)];
      }
    });

    // Broadcast live telemetry to all connected WebSocket clients
    if (this.io) {
      this.io.emit("vehicles:update", this.vehicles);
    }
  }

  getVehicle(tripKey = "home") {
    return this.vehicles[tripKey] || this.vehicles.default;
  }

  getAllVehicles() {
    return this.vehicles;
  }

  resetVehicle(tripKey) {
    if (this.vehicles[tripKey]) {
      this.vehicles[tripKey].phase = "waiting";
      this.vehicles[tripKey].waitProgress = 5;
      this.vehicles[tripKey].tripProgress = 0;
      this.vehicles[tripKey].stopsAway = 2;
      this.vehicles[tripKey].etaToBoardMin = 5;
      this.vehicles[tripKey].delayMin = 0;
      this.vehicles[tripKey].currentStop = `Approaching ${this.vehicles[tripKey].stops[1] || "Sector V"}`;
    }
  }

  // SIH Hackathon Demo tool: Inject simulated traffic bottleneck or signal delay
  injectDelay(tripKey, delayMinutes = 10, reason = "Heavy traffic congestion") {
    const v = this.vehicles[tripKey];
    if (v) {
      v.delayMin += delayMinutes;
      v.etaToBoardMin += delayMinutes;
      v.crowdLevel = "High";
      if (v.vehicleType === "bus") {
        v.coachCrowds = ["High", "High", "High"];
      }
      return { success: true, message: `Injected +${delayMinutes}m delay to ${v.routeLabel}`, vehicle: v };
    }
    return { success: false, message: "Vehicle not found" };
  }
}

export const simulation = new SimulationEngine();
