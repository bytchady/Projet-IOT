import { Component, OnInit, HostListener, ViewChild, ChangeDetectorRef } from '@angular/core';
import { SearchBar } from '../search-bar/search-bar';
import { RoomCard } from '../room-card/room-card';
import { FormsModule } from '@angular/forms';
import { Room } from '../../../models/room';
import { RoomsServices } from '../../../services/rooms/rooms.service';
import { ServerMessagesServices } from '../../../services/server-messages/server-messages.services';
import { RouterLink } from '@angular/router';
import { AuthServices } from '../../../services/auth/auth.services';

@Component({
  selector: 'app-home-component',
  imports: [SearchBar, RoomCard, FormsModule, RouterLink],
  templateUrl: './home-component.html',
  styleUrls: ['./home-component.scss'],
})
export class HomeComponent implements OnInit {
  allRooms: Room[] = [];
  rooms: Room[] = [];
  pagedRooms: Room[] = [];
  newRoomName: string = '';

  isLoading: boolean = true;

  currentPage: number = 1;
  rowsPerPage: number = 2;
  cardsPerRow: number = 3;
  pageSize: number = this.rowsPerPage * this.cardsPerRow;

  isMobile: boolean = window.innerWidth < 576;

  @ViewChild(SearchBar) searchBar!: SearchBar;

  constructor(
    private roomsServices: RoomsServices,
    private serverMessagesServices: ServerMessagesServices,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    this.roomsServices.getRooms().subscribe({
      next: rooms => {
        const sortedRooms = rooms.sort((a, b) =>
          a.nameRoom.localeCompare(b.nameRoom)
        );
        this.allRooms = [...sortedRooms];
        this.rooms = [...sortedRooms];
        this.currentPage = 1;
        this.updatePagedRooms();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        this.serverMessagesServices.showMessage('Erreur serveur', true);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 576;
    this.updatePageSettings();
    this.updatePagedRooms();
  }

  onAddRoom() {
    const roomName = this.newRoomName.trim();
    if (!roomName) return;

    const payload: Partial<Room> = {
      nameRoom: roomName,
      ipArduino: '0.0.0.0',
      volumeRoom: 0,
      glazedSurface: 0,
      nbDoors: 0,
      nbExteriorWalls: 0,
      minTemp: 18,
      maxTemp: 24,
      isExists: true,
      schedule: {
        monday: { start: '08:00', end: '18:00', isClosed: false },
        tuesday: { start: '08:00', end: '18:00', isClosed: false },
        wednesday: { start: '08:00', end: '18:00', isClosed: false },
        thursday: { start: '08:00', end: '18:00', isClosed: false },
        friday: { start: '08:00', end: '18:00', isClosed: false },
        saturday: { start: null, end: null, isClosed: true },
        sunday: { start: null, end: null, isClosed: true },
      },
    };

    this.roomsServices.createRoom(payload).subscribe({
      next: res => {
        this.serverMessagesServices.showMessage(res.message, res.error);

        if (!res.error && res.data) {
          this.allRooms.push(res.data);

          this.allRooms.sort((a, b) => a.nameRoom.localeCompare(b.nameRoom));
          this.rooms = [...this.allRooms];

          const newRoomIndex = this.rooms.findIndex(
            room => room.idRoom === res.data.idRoom
          );

          if (newRoomIndex !== -1) {
            this.currentPage = Math.floor(newRoomIndex / this.pageSize) + 1;
          } else {
            this.currentPage = 1;
          }

          this.updatePagedRooms();
          this.cdr.detectChanges();
        }
      },
      error: err => {
        this.serverMessagesServices.showMessage(err.error?.message || 'Erreur serveur', true);
      }
    });

    this.newRoomName = '';
  }

  onSearchRoom(query: string) {
    this.currentPage = 1;
    if (!query) {
      this.rooms = [...this.allRooms];
      this.updatePagedRooms();
      return;
    }

    const filteredRooms = this.allRooms.filter((room) =>
      room.nameRoom.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredRooms.length === 0) {
      this.serverMessagesServices.showMessage(`Aucun résultat correspondant à "${query}"`, true);
      this.searchBar.clear();
      return;
    }

    this.rooms = filteredRooms;
    this.updatePagedRooms();
    this.serverMessagesServices.clearMessage();
  }

  updatePageSettings() {
    if (this.isMobile) {
      this.rowsPerPage = 1;
      this.cardsPerRow = 1;
    } else {
      this.rowsPerPage = 2;
      this.cardsPerRow = 3;
    }
    this.pageSize = this.rowsPerPage * this.cardsPerRow;
  }

  updatePagedRooms() {
    if (this.currentPage > this.totalPages() && this.totalPages() > 0) {
      this.currentPage = this.totalPages();
    }
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedRooms = this.rooms.slice(start, end);
  }

  getVisiblePages(): number[] {
    const total = this.totalPages();
    let start = Math.max(this.currentPage - 2, 1);
    let end = Math.min(start + 3, total);
    if (end - start < 3) start = Math.max(end - 3, 1);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
      this.updatePagedRooms();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedRooms();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
      this.updatePagedRooms();
    }
  }

  totalPages(): number {
    return Math.ceil(this.rooms.length / this.pageSize);
  }
}
