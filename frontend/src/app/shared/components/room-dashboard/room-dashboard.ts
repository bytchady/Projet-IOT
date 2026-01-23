import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Room } from '../../../models/room';
import { RoomsService } from '../../../services/rooms.service';
import { Sensor } from '../../../models/sensor';
import { RoomSensorsService } from '../../../services/roomSensors.service';
import { SensorGraph } from '../sensor-graph/sensor-graph';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-room-dashboard',
  imports: [
    SensorGraph,
    FormsModule,
  ],
  templateUrl: './room-dashboard.html',
  styleUrl: './room-dashboard.scss',
})
export class RoomDashboard implements OnInit {

  room!: Room;
  //sensors: Sensor[] = [];

  isEditing = false;
  // newSensorUUID = '';
  // newSensorType = '';
  // editingSensorId: string | null = null;
  //
  // sensorTypes: string[] = []; // liste de types disponibles

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomsService: RoomsService,
    //private roomSensorsService: RoomSensorsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    const r = this.roomsService.getRoomById(id);
    if (!r) return;

    this.room = r;

    //this.sensorTypes = this.roomSensorsService.getSensorTypes().map(t => t.name);

    //this.loadSensors();
  }

  // // 🔄 Charger les capteurs
  // loadSensors() {
  //   this.roomSensorsService.getSensorsByRoom(this.room).subscribe(sensors => {
  //     this.sensors = sensors || [];
  //   });
  // }

  // ✏️ Edition salle
  toggleEdit() {
    if (this.isEditing) {
      this.saveRoomChanges();
    }
    this.isEditing = !this.isEditing;
  }

  saveRoomChanges() {
    console.log('Room updated:', this.room);
    // TODO: appel backend pour persistance
  }

  // 🗑️ Supprimer salle (soft delete)
  onDeleteRoom() {
    const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer la salle ${this.room.nameRoom} ?`);
    if (!confirmDelete) return;

    this.roomsService.deleteRoom(this.room.idRoom);
    this.router.navigate(['/']);
  }

  onMinTempChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);
    if (value > this.room.maxTemp) {
      value = this.room.maxTemp;
    }
    this.room.minTemp = value;
    input.value = value.toString();
  }

  onMaxTempChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);
    if (value < this.room.minTemp) {
      value = this.room.minTemp;
    }
    this.room.maxTemp = value;
    input.value = value.toString();
  }

  onMinHumChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);
    if (value > this.room.maxHum) {
      value = this.room.maxHum;
    }
    this.room.minHum = value;
    input.value = value.toString();
  }

  onMaxHumChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);
    if (value < this.room.minHum) {
      value = this.room.minHum;
    }
    this.room.maxHum = value;
    input.value = value.toString();
  }

  // onAddSensor() {
  //   if (!this.newSensorUUID.trim() || !this.newSensorType.trim()) return;
  //
  //   this.roomSensorsService.addSensor(this.newSensorUUID, this.newSensorType, this.room)
  //     .subscribe(() => {
  //       this.newSensorUUID = '';
  //       this.newSensorType = '';
  //       this.loadSensors(); // recharge le tableau actualisé
  //     });
  // }


  // // 🗑️ Supprimer capteur
  // onDeleteSensor(id: string) {
  //   const confirmDelete = confirm('Supprimer ce capteur ?');
  //   if (!confirmDelete) return;
  //
  //   this.roomSensorsService.deleteSensor(id);
  //   this.loadSensors();
  // }

  // // 🔄 Activer / désactiver capteur
  // toggleSensorStatus(id: string) {
  //   this.roomSensorsService.toggleSensorStatus(id);
  //   this.loadSensors();
  // }

  // 🎨 Couleur graphique par type
  getSensorColor(sensorType: string): string {
    switch(sensorType) {
      case 'Temperature': return 'rgba(255,99,132,1)';
      case 'CO2': return 'rgba(54,162,235,1)';
      default: return 'rgba(0,0,0,1)';
    }
  }
}
