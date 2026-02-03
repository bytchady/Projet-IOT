import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Room } from '../../../models/room';
import { RoomsServices } from '../../../services/rooms/rooms.service';
import { SensorGraph } from '../sensor-graph/sensor-graph';
import { ServerMessagesServices } from '../../../services/server-messages/server-messages.services';

@Component({
  selector: 'app-room-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SensorGraph,
  ],
  templateUrl: './room-dashboard.html',
  styleUrls: ['./room-dashboard.scss'],
})
export class RoomDashboard implements OnInit {
  @ViewChild('tempGraph') tempGraph?: SensorGraph;
  @ViewChild('co2Graph') co2Graph?: SensorGraph;
  @ViewChild('humGraph') humGraph?: SensorGraph;

  room: Room | null = null;
  isLoading: boolean = true;  // ⬅️ AJOUT
  isEditing = false;
  today = '';
  currentDayIndex = 0;

  readonly weekDays: (keyof Room['schedule'])[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  readonly dayTranslations: Record<keyof Room['schedule'], string> = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomsService: RoomsServices,
    private serverMessageService: ServerMessagesServices,
    private cdr: ChangeDetectorRef  // ⬅️ AJOUT
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    this.today = new Date().toLocaleDateString('fr-FR');
    this.isLoading = true;  // ⬅️ AJOUT

    this.roomsService.getRoomById(id).subscribe({
      next: (room) => {
        if (!room) {
          this.serverMessageService.showMessage('Salle introuvable', true);
          this.isLoading = false;  // ⬅️ AJOUT
          this.cdr.detectChanges();  // ⬅️ AJOUT
          this.router.navigate(['/']);
          return;
        }
        this.room = room;
        this.isLoading = false;  // ⬅️ AJOUT
        this.cdr.detectChanges();  // ⬅️ AJOUT
      },
      error: () => {
        this.serverMessageService.showMessage('Erreur serveur', true);
        this.isLoading = false;  // ⬅️ AJOUT
        this.cdr.detectChanges();  // ⬅️ AJOUT
        this.router.navigate(['/']);
      },
    });
  }

  toggleEdit(): void {
    if (this.isEditing) {
      this.saveRoomChanges();
    } else {
      this.isEditing = true;
    }
  }

  saveRoomChanges(): void {
    if (!this.room) return;

    this.roomsService.updateRoom(this.room).subscribe({
      next: (updatedRoom) => {
        this.room = updatedRoom;
        this.tempGraph?.ngOnChanges();
        this.co2Graph?.ngOnChanges();
        this.humGraph?.ngOnChanges();
        this.isEditing = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDeleteRoom(): void {
    if (!this.room) return;

    if (!confirm(`Êtes-vous sûr de vouloir supprimer la salle "${this.room.nameRoom}" ?`)) return;

    this.roomsService.deleteRoom(this.room.idRoom).subscribe({
      next: () => {
        this.serverMessageService.showMessage('Salle supprimée', false);
        this.router.navigate(['/']);
      },
      error: () => {
        this.serverMessageService.showMessage('Erreur lors de la suppression', true);
      },
    });
  }

  onMinTempChange(event: Event): void {
    if (!this.room) return;

    const input = event.target as HTMLInputElement;
    let value = Number(input.value);
    if (value > this.room.maxTemp) value = this.room.maxTemp;
    this.room.minTemp = value;
    input.value = value.toString();
  }

  onMaxTempChange(event: Event): void {
    if (!this.room) return;

    const input = event.target as HTMLInputElement;
    let value = Number(input.value);
    if (value < this.room.minTemp) value = this.room.minTemp;
    this.room.maxTemp = value;
    input.value = value.toString();
  }

  prevDay(): void {
    this.currentDayIndex =
      this.currentDayIndex > 0
        ? this.currentDayIndex - 1
        : this.weekDays.length - 1;
  }

  nextDay(): void {
    this.currentDayIndex =
      this.currentDayIndex < this.weekDays.length - 1
        ? this.currentDayIndex + 1
        : 0;
  }

  onToggleClosed(day: keyof Room['schedule']): void {
    if (!this.room) return;

    const schedule = this.room.schedule[day];
    if (schedule.isClosed) {
      schedule.start = null;
      schedule.end = null;
    }
  }
}
