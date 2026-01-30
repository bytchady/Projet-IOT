import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { SearchBar } from '../search-bar/search-bar';
import { RoomCard } from '../room-card/room-card';
import { FormsModule } from '@angular/forms';
import { Room } from '../../../models/room';
import { RoomsServices } from '../../../services/rooms/rooms.service';
import { ServerMessagesServices } from '../../../services/server-messages/server-messages.services';
import { RouterLink } from '@angular/router';
import {AuthServices} from '../../../services/auth/auth.services';

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

  currentPage: number = 1;
  rowsPerPage: number = 2;
  cardsPerRow: number = 3;
  pageSize: number = this.rowsPerPage * this.cardsPerRow;

  isMobile: boolean = window.innerWidth < 576;

  @ViewChild(SearchBar) searchBar!: SearchBar;

  constructor(
    private roomsServices: RoomsServices,
    private serverMessagesServices: ServerMessagesServices,
    private authServices: AuthServices
  ) {}

  ngOnInit() {
    this.roomsServices.rooms$.subscribe(rooms => {
      this.allRooms = rooms;
      this.rooms = [...rooms];
      this.updatePagedRooms();
    });

    if (this.authServices.isLoggedIn()) {
      this.roomsServices.loadRooms();
    }
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 576;
    this.updatePageSettings();
    this.updatePagedRooms();
  }

  /** Création d'une nouvelle salle */
  onAddRoom() {
    const payload = {
      nameRoom: this.newRoomName.trim(),
      ipArduino: '0.0.0.0',
      volumeRoom: 0,
      glazedSurface: 0,
      nbDoors: 0,
      nbExteriorWalls: 0,
      minTemp: 0,
      maxTemp: 0,
      schedule: {
        monday: { start: '00:00', end: '00:00' },
        tuesday: { start: '00:00', end: '00:00' },
        wednesday: { start: '00:00', end: '00:00' },
        thursday: { start: '00:00', end: '00:00' },
        friday: { start: '00:00', end: '00:00' },
        saturday: { start: '00:00', end: '00:00' },
        sunday: { start: '00:00', end: '00:00' },
      },
      isExists: true
    };

    this.roomsServices.createRoom(payload).subscribe({
      next: (res) => {
        if (!res.error) {
          this.roomsServices.loadRooms();
          this.serverMessagesServices.showMessage(res.message, false);
        } else {
          this.serverMessagesServices.showMessage(res.message, true);
        }
      },
      error: (err) => {
        this.serverMessagesServices.showMessage(err.error?.message || 'Erreur serveur', true);
      }
    });

    this.newRoomName = '';
  }

  /** Recherche de salle */
  onSearchRoom(query: string) {
    this.currentPage = 1;
    if (!query) {
      this.rooms = [...this.allRooms];
      this.updatePagedRooms();
      return;
    }

    const filteredRooms = this.allRooms.filter(room =>
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

  /** Pagination et affichage */
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
    if (this.currentPage > this.totalPages()) this.currentPage = 1;
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
