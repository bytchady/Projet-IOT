import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import {SearchBar} from '../search-bar/search-bar';
import {RoomCard} from '../room-card/room-card';
import {FormsModule} from '@angular/forms';
import {Room} from '../../../models/room';
import {RoomsService} from '../../../services/rooms.service';
import {ServerMessageService} from '../../../services/serverMessages.service';

@Component({
  selector: 'app-home-component',
  imports: [SearchBar, RoomCard, FormsModule],
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
    private roomsService: RoomsService,
    private serverMessageService: ServerMessageService
  ) {}

  ngOnInit() {
    this.allRooms = this.roomsService.getRooms();
    this.rooms = [...this.allRooms];
    this.updatePageSettings();
    this.updatePagedRooms();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 576;
    this.updatePageSettings();
    this.updatePagedRooms();
  }

  onAddRoom() {
    const result = this.roomsService.createRoom(this.newRoomName);
    this.serverMessageService.showMessage(result.message, !result.success);

    if (result.success && result.room) {
      this.allRooms = this.roomsService.getRooms();
      this.rooms = [...this.allRooms];
      const index = this.rooms.findIndex(r => r.id === result.room!.id);
      this.currentPage = Math.floor(index / this.pageSize) + 1;
      this.updatePagedRooms();
    }

    this.newRoomName = '';
  }

  onSearchRoom(query: string) {
    this.currentPage = 1;

    if (!query) {
      this.rooms = [...this.allRooms];
      this.updatePagedRooms();
      return;
    }

    const filteredRooms = this.allRooms.filter(room =>
      room.name.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredRooms.length === 0) {
      this.serverMessageService.showMessage(
        `Aucun résultat correspondant à "${query}"`,
        true
      );
      this.searchBar.clear();
      return;
    }

    this.rooms = filteredRooms;
    this.updatePagedRooms();
    this.serverMessageService.clearMessage();
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
