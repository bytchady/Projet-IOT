import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Room} from '../../../models/room';
import {RoomsServices} from '../../../services/rooms/rooms.service';
import {SensorGraph} from '../sensor-graph/sensor-graph';
import {FormsModule} from '@angular/forms';
import {ServerMessagesServices} from '../../../services/server-messages/server-messages.services';

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

  weekDays: (keyof Room['schedule'])[] = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];
  dayTranslations: { [key in keyof Room['schedule']]: string } = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche'
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

    // ✅ Appel backend pour récupérer la salle
    this.roomsService.getRoomById(id).subscribe({
      next: (res) => {
        if (res.error) {
          this.serverMessageService.showMessage(res.message, true);
          this.router.navigate(['/']);
          return;
        }
        this.room = res.data;
      },
      error: (err) => {
        this.serverMessageService.showMessage('Erreur serveur', true);
        this.router.navigate(['/']);
      }
    });

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    this.today = `${day}/${month}/${year}`;
  }

  isValidTime(value: string): boolean {
    // regex HH:mm
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
  }

  checkFormat(day: keyof Room['schedule'], type: 'start' | 'end') {
    const value = this.room.schedule[day][type];
    if (!this.isValidTime(value)) {
      console.error(`Format non valide pour ${type} du ${day}: "${value}"`);
      // TODO: plus tard on pourra envoyer au backend
    }
  }

  validateTime(day: keyof Room['schedule'], type: 'start' | 'end') {
    const value = this.room.schedule[day][type];

    if (!this.isValidTime(value)) {
      this.serverMessageService.showMessage(
        "Format non valide. Veuillez saisir HH:mm.",
        true
      );
      return;
    }

    // Arrondir minutes à 0 ou 30 si besoin
    const [h, m] = value.split(':').map(Number);
    const roundedM = m >= 30 ? 30 : 0;
    this.room.schedule[day][type] = `${String(h).padStart(2, '0')}:${String(roundedM).padStart(2, '0')}`;

    // Forcer start <= end
    const start = this.room.schedule[day].start;
    const end = this.room.schedule[day].end;

    if (type === 'start' && start > end) this.room.schedule[day].end = start;
    if (type === 'end' && end < start) this.room.schedule[day].start = end;
  }

  toggleEdit() {
    if (this.isEditing) {
      // ✅ On envoie directement au backend, tout contrôle se fait côté serveur
      this.saveRoomChanges();
    }
    this.isEditing = !this.isEditing;
  }

  saveRoomChanges() {
    if (!this.room.idRoom) return;

    const payload = {
      ...this.room,
      id_room: this.room.idRoom
    };

    this.roomsService.updateRoom(payload).subscribe({
      next: (res) => {
        if (res.error) {
          this.serverMessageService.showMessage(res.message, true);
          return;
        }
        this.room = res.data;
        this.serverMessageService.showMessage('Salle mise à jour avec succès', false);

        // Mettre à jour les graphiques
        this.tempGraph?.ngOnChanges();
        this.co2Graph?.ngOnChanges();
        this.humGraph?.ngOnChanges();
      },
      error: () => {
        this.serverMessageService.showMessage('Erreur serveur', true);
      }
    });
  }

  onDeleteRoom() {
    const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer la salle "${this.room.nameRoom}" ?`);
    if (!confirmDelete) return;

    this.roomsService.deleteRoom(this.room.idRoom).subscribe({
      next: (res) => {
        if (res.error) {
          this.serverMessageService.showMessage(res.message, true);
          return;
        }
        this.serverMessageService.showMessage('Salle supprimée avec succès', false);
        this.router.navigate(['/']);
      },
      error: () => {
        this.serverMessageService.showMessage('Erreur serveur', true);
      }
    });
  }

  onMinTempChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);
    if (value > this.room.maxTemp) value = this.room.maxTemp;
    this.room.minTemp = value;
    input.value = value.toString();
  }

  onMaxTempChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);
    if (value < this.room.minTemp) value = this.room.minTemp;
    this.room.maxTemp = value;
    input.value = value.toString();
  }
}
