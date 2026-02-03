import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Room } from '../../../models/room';
import { RoomsServices } from '../../../services/rooms/rooms.service';
import { SensorGraph } from '../sensor-graph/sensor-graph';
import { ServerMessagesServices } from '../../../services/server-messages/server-messages.services';

@Component({
  selector: 'app-room-dashboard',
  imports: [
    SensorGraph,
    FormsModule,
  ],
  templateUrl: './room-dashboard.html',
  styleUrls: ['./room-dashboard.scss'],
})
export class RoomDashboard implements OnInit {
  @ViewChild('tempGraph') tempGraph!: SensorGraph;
  @ViewChild('co2Graph') co2Graph!: SensorGraph;
  @ViewChild('humGraph') humGraph!: SensorGraph;

  room!: Room;
  isEditing = false;
  today!: string;
  currentDayIndex = 0;


  weekDays: (keyof Room['schedule'])[] = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  dayTranslations: { [key in keyof Room['schedule']]: string } = {
    monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi',
    thursday: 'Jeudi', friday: 'Vendredi', saturday: 'Samedi', sunday: 'Dimanche'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomsService: RoomsServices,
    private serverMessageService: ServerMessagesServices
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.today = new Date().toLocaleDateString('fr-FR');

    this.roomsService.getRoomById(id).subscribe({
      next: (res) => {
        if (res.error || !res.data) {
          this.serverMessageService.showMessage(res.message || 'Salle introuvable', true);
          this.router.navigate(['/']);
          return;
        }
        this.room = res.data;
      },
      error: () => {
        this.serverMessageService.showMessage('Erreur serveur', true);
        this.router.navigate(['/']);
      }
    });
  }

  toggleEdit() {
    if (this.isEditing) {
      this.saveRoomChanges();
      return;
    }
    this.isEditing = true;
  }

  saveRoomChanges() {
    if (!this.room.idRoom) return;

    this.roomsService.updateRoom(this.room).subscribe({
      next: (res) => {
        if (res.error) {
          this.serverMessageService.showMessage(res.message, true);
          return;
        }

        // Backend accepte → on met à jour les données et quitte le mode édition
        this.room = res.data!;
        this.tempGraph?.ngOnChanges();
        this.co2Graph?.ngOnChanges();
        this.humGraph?.ngOnChanges();
        this.isEditing = false;
        this.serverMessageService.showMessage(res.message, false);
      },
      error: (err) => {
        // Erreur réseau ou backend non standard
        this.serverMessageService.showMessage(err?.error?.message || 'Erreur serveur', true);
      }
    });
  }


  onDeleteRoom() {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la salle "${this.room.nameRoom}" ?`)) return;

    this.roomsService.deleteRoom(this.room.idRoom).subscribe({
      next: res => {
        this.serverMessageService.showMessage(res.message, res.error);
        if (!res.error) this.router.navigate(['/']);
      },
      error: err => {
        this.serverMessageService.showMessage(err?.message || 'Erreur serveur', true);
      }
    });
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

  prevDay() {
    if (this.currentDayIndex > 0) {
      this.currentDayIndex--;
    } else {
      this.currentDayIndex = this.weekDays.length - 1;
    }
  }

  nextDay() {
    if (this.currentDayIndex < this.weekDays.length - 1) {
      this.currentDayIndex++;
    } else {
      this.currentDayIndex = 0;
    }
  }

  onToggleClosed(day: keyof Room['schedule']) {
    const schedule = this.room.schedule[day];
    if (schedule.isClosed) {
      schedule.start = null;
      schedule.end = null;
    } else {
      schedule.start;
      schedule.end;
    }
  }
}
