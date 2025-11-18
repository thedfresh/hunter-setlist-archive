import { getBrowsableEventsWhere, getCountableEventsWhere } from '@/lib/utils/queryFilters';
import { prisma } from '@/lib/prisma';

export type GetEventsBrowseParams = {
  page?: number;
  pageSize?: number;
  where?: any;
  performerType?: string;
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  verified?: boolean;
};

export async function getHunterPerformanceStats() {
  const totalShows = await prisma.event.count({
    where: getCountableEventsWhere()
  });

  const firstShow = await prisma.event.findFirst({
    where: getCountableEventsWhere(),
    orderBy: { sortDate: 'asc' },
    select: { year: true, month: true, day: true, displayDate: true, sortDate: true }
  });
  const lastShow = await prisma.event.findFirst({
    where: getCountableEventsWhere(),
    orderBy: { sortDate: 'desc' },
    select: { year: true, month: true, day: true, displayDate: true, sortDate: true }
  });

  const bandCounts = await prisma.event.groupBy({
    by: ['primaryBandId'],
    where: getCountableEventsWhere(),
    _count: { _all: true },
  });

  const bandIds = bandCounts.map(bc => bc.primaryBandId).filter((id): id is number => id !== null);
  const bands = await prisma.band.findMany({
    where: { id: { in: bandIds } },
    select: { id: true, name: true },
  });
  const bandNameMap = Object.fromEntries(bands.map(b => [b.id, b.name]));
  const breakdown = bandCounts.map(bc => ({
    name: bc.primaryBandId === null ? 'Solo' : (bandNameMap[bc.primaryBandId] || 'Other'),
    count: bc._count._all,
  }));

  return {
    totalShows,
    firstShow,
    lastShow,
    breakdown,
  };
}

export async function getEventsOnThisDate() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const events = await prisma.event.findMany({
    where: {
      ...getBrowsableEventsWhere(),
      month,
      day,
    },
    select: {
      id: true,
      year: true,
      month: true,
      day: true,
      displayDate: true,
      slug: true,
      verified: true,
      showTiming: true,
      venue: {
        select: {
          name: true,
          city: true,
          stateProvince: true,
        },
      },
      primaryBand: {
        select: {
          name: true,
        },
      },
      eventType: { select: { name: true } },
      contentType: { select: { name: true } },
      sets: {
        select: {
          id: true,
          setType: { select: { displayName: true } },
          performances: {
            select: {
              id: true,
              song: { select: { title: true } },
              seguesInto: true,
              performanceOrder: true,
            },
            orderBy: { performanceOrder: 'asc' },
          },
        },
        orderBy: { position: 'asc' },
      },
    },
    orderBy: { sortDate: 'asc' },
  });
  return events;
}

export async function getEventsBrowse({ page, pageSize = 100, where = {} }: GetEventsBrowseParams) {
  const finalWhere = Object.keys(where).length > 0 ? where : getBrowsableEventsWhere();
  const skipPagination = !page;

  const queryOptions: any = {
    where: finalWhere,
    select: {
      id: true,
      slug: true,
      displayDate: true,
      sortDate: true,
      year: true,
      month: true,
      day: true,
      showTiming: true,
      verified: true,
      isUncertain: true,
      dateUncertain: true,
      venueUncertain: true,
      publicNotes: true,
      billing: true,

      venue: {
        select: {
          name: true,
          city: true,
          stateProvince: true,
          slug: true,
          isUncertain: true
        }
      },

      primaryBand: {
        select: {
          name: true,
          slug: true
        }
      },

      eventType: {
        select: {
          name: true,
          includeInStats: true
        }
      },

      contentType: {
        select: {
          name: true
        }
      },

      eventMusicians: {
        select: {
          publicNotes: true,
          musician: {
            select: {
              name: true,
              slug: true
            }
          },
          instruments: {
            include: {
              instrument: {
                select: {
                  displayName: true
                }
              }
            }
          }
        }
      },

      sets: {
        select: {
          id: true,
          position: true,
          publicNotes: true,
          isUncertain: true,

          setType: {
            select: {
              displayName: true
            }
          },

          band: {
            select: {
              name: true
            }
          },

          setMusicians: {
            select: {
              musician: {
                select: {
                  name: true
                }
              },
              instruments: {
                include: {
                  instrument: {
                    select: {
                      displayName: true
                    }
                  }
                }
              }
            }
          },

          performances: {
            select: {
              id: true,
              performanceOrder: true,
              seguesInto: true,
              isMedley: true,
              isLyricalFragment: true,
              isMusicalFragment: true,
              isPartial: true,
              isUncertain: true,
              isSoloHunter: true,
              publicNotes: true,

              song: {
                select: {
                  id: true,
                  title: true,
                  slug: true
                }
              },

              leadVocals: {
                select: {
                  id: true,
                  name: true
                }
              },

              performanceMusicians: {
                select: {
                  publicNotes: true,
                  musician: {
                    select: {
                      name: true,
                      slug: true
                    }
                  },
                  instruments: {
                    include: {
                      instrument: {
                        select: {
                          displayName: true
                        }
                      }
                    }
                  }
                }
              }
            },
            orderBy: { performanceOrder: 'asc' }
          }
        },
        orderBy: { position: 'asc' }
      },

      _count: {
        select: {
          recordings: true
        }
      }
    },
    orderBy: { sortDate: 'asc' }
  };

  if (!skipPagination) {
    queryOptions.skip = ((page || 1) - 1) * pageSize;
    queryOptions.take = pageSize;
  }

  const [totalCount, events] = await Promise.all([
    prisma.event.count({ where: finalWhere }),
    prisma.event.findMany(queryOptions)
  ]);

  return {
    events,
    totalCount,
    currentPage: page || 1,
    totalPages: skipPagination ? 1 : Math.ceil(totalCount / pageSize),
    pageSize
  };
}

type EventType = {
  sets?: Array<{ performances: any[] }>;
  sortDate: string | Date | null;
  year: number | null;
  primaryBandId: number | null;
};

export async function calculateEventStatistics(event: EventType) {
  const firstPerformances: Array<{ songId: number; songTitle: string; songSlug: string }> = [];
  const lastPerformances: Array<{ songId: number; songTitle: string; songSlug: string }> = [];
  const onlyPerformances: Array<{ songId: number; songTitle: string; songSlug: string }> = [];
  const comebacks: Array<{ songId: number; songTitle: string; songSlug: string; gap: number }> = [];

  const performances = event.sets?.flatMap((set: { performances: any[] }) => set.performances) || [];
  const filteredPerformances = performances.filter(
    (perf: any) => perf.song.title !== 'Unknown Song'
  );

  for (const perf of filteredPerformances) {
    const songId = perf.song.id;
    const songTitle = perf.song.title;
    const songSlug = perf.song.slug;
    const perfDate = event.sortDate;

    const [earlier, later] = await Promise.all([
      prisma.performance.findFirst({
        where: {
          songId,
          set: {
            event: {
              ...getBrowsableEventsWhere(),
              ...(perfDate ? { sortDate: { lt: perfDate } } : {}),
            },
          },
        },
      }),
      prisma.performance.findFirst({
        where: {
          songId,
          set: {
            event: {
              ...getBrowsableEventsWhere(),
              ...(perfDate ? { sortDate: { gt: perfDate } } : {}),
            },
          },
        },
      })
    ]);

    if (!earlier && !later) {
      if (!onlyPerformances.some(p => p.songId === songId)) {
        onlyPerformances.push({ songId, songTitle, songSlug });
      }
    } else if (!earlier) {
      if (!firstPerformances.some(p => p.songId === songId)) {
        firstPerformances.push({ songId, songTitle, songSlug });
      }
    } else if (!later) {
      if (!lastPerformances.some(p => p.songId === songId)) {
        lastPerformances.push({ songId, songTitle, songSlug });
      }
    }

    let prevPerf = null;
    if (perfDate) {
      prevPerf = await prisma.performance.findFirst({
        where: {
          songId,
          set: {
            event: {
              ...getCountableEventsWhere(),
              sortDate: { lt: perfDate },
            },
          },
        },
        orderBy: [{ set: { event: { sortDate: 'desc' } } }],
        include: { set: { include: { event: true } } },
      });
    }
    if (prevPerf && prevPerf.set && prevPerf.set.event && prevPerf.set.event.sortDate && perfDate) {
      const gapCount = await prisma.event.count({
        where: {
          ...getCountableEventsWhere(),
          sortDate: { gt: prevPerf.set.event.sortDate, lt: perfDate },
          sets: { some: { performances: { some: {} } } },
          OR: [
            { primaryBandId: null },
            { primaryBand: { isHunterBand: true } },
          ],
        },
      });
      if (gapCount >= 50 && !comebacks.some(p => p.songId === songId)) {
        comebacks.push({ songId, songTitle, songSlug, gap: gapCount });
      }
    }
  }

  return {
    firstPerformances,
    lastPerformances,
    onlyPerformances,
    comebacks,
  };
}

export async function getEventBySlug(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      venue: true,
      primaryBand: true,
      eventType: true,
      contentType: true,
      eventMusicians: {
        include: {
          musician: true,
          instruments: {
            include: {
              instrument: true
            }
          }
        },
      },
      sets: {
        include: {
          setType: true,
          band: true,
          setMusicians: {
            include: {
              musician: true,
              instruments: {
                include: {
                  instrument: true
                }
              }
            },
          },
          performances: {
            include: {
              leadVocals: {
                select: {
                  id: true,
                  name: true,
                }
              },
              song: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  songTags: {
                    include: {
                      tag: {
                        select: {
                          id: true,
                          name: true,
                        }
                      }
                    }
                  },
                  leadVocals: {
                    select: {
                      id: true,
                      name: true,
                    }
                  }
                }
              },
              performanceMusicians: {
                include: {
                  musician: true,
                  instruments: {
                    include: {
                      instrument: true
                    }
                  }
                },
              },
            },
            orderBy: { performanceOrder: 'asc' },
          },
        },
        orderBy: { position: 'asc' },
      },
      recordings: {
        include: {
          recordingType: true,
          contributor: true,
        },
      },
      eventContributors: {
        include: {
          contributor: true,
        },
      },
      links: true,
    },
  });
  if (!event || !event.isPublic) {
    return null;
  }
  return event;
}

export async function getEventWithNavigation(slug: string, isAdmin: boolean = false) {
  const event = await getEventBySlug(slug);
  if (!event) return { event: null, prevEvent: null, nextEvent: null };

  let prevEvent = null;
  let nextEvent = null;
  if (event?.sortDate) {
    prevEvent = await prisma.event.findFirst({
      where: isAdmin ? {
        OR: [
          { sortDate: { lt: event.sortDate } },
          {
            sortDate: event.sortDate,
            id: { lt: event.id }
          }
        ]
      } : {
        isPublic: true,
        OR: [
          { sortDate: { lt: event.sortDate } },
          {
            sortDate: event.sortDate,
            id: { lt: event.id }
          }
        ]
      },
      orderBy: [
        { sortDate: 'desc' },
        { id: 'desc' }
      ],
      select: { id: true, slug: true, displayDate: true, sortDate: true },
    });

    nextEvent = await prisma.event.findFirst({
      where: isAdmin ? {
        OR: [
          { sortDate: { gt: event.sortDate } },
          {
            sortDate: event.sortDate,
            id: { gt: event.id }
          }
        ]
      } : {
        isPublic: true,
        OR: [
          { sortDate: { gt: event.sortDate } },
          {
            sortDate: event.sortDate,
            id: { gt: event.id }
          }
        ]
      },
      orderBy: [
        { sortDate: 'asc' },
        { id: 'asc' }
      ],
      select: { id: true, slug: true, displayDate: true, sortDate: true },
    });
  }
  return { event, prevEvent, nextEvent };
}

export async function searchEvents(filters: any) {
  const page = parseInt(filters?.page || '1', 10) || 1;
  const pageSize = parseInt(filters?.pageSize || '100', 10) || 100;
  const where = filters?.where || {};

  const [totalCount, events] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      include: {
        venue: true,
        primaryBand: true,
        eventType: true,
        contentType: true,
        eventMusicians: {
          include: {
            musician: true,
            instruments: {
              include: {
                instrument: true
              }
            }
          },
        },
        sets: {
          include: {
            setType: true,
            band: true,
            setMusicians: {
              include: {
                musician: true,
                instruments: {
                  include: {
                    instrument: true
                  }
                }
              },
            },
            performances: {
              include: {
                leadVocals: {
                  select: {
                    id: true,
                    name: true,
                  }
                },
                song: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    songTags: {
                      include: {
                        tag: {
                          select: {
                            id: true,
                            name: true,
                          }
                        }
                      }
                    },
                    leadVocals: {
                      select: {
                        id: true,
                        name: true,
                      }
                    }
                  }
                },
                performanceMusicians: {
                  include: {
                    musician: true,
                    instruments: {
                      include: {
                        instrument: true
                      }
                    }
                  },
                },
              },
              orderBy: { performanceOrder: 'asc' },
            },
          },
          orderBy: { position: 'asc' },
        },
        recordings: {
          include: {
            recordingType: true,
            contributor: true,
          },
        },
        eventContributors: {
          include: {
            contributor: true,
          },
        },
        links: true,
      },
      orderBy: { sortDate: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })
  ]);

  return {
    events,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / pageSize),
    pageSize,
  };
}

export async function getEventBySlugWithNavigation(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      venue: true,
      primaryBand: true,
      eventType: true,
      contentType: true,
      eventMusicians: {
        include: {
          musician: true,
          instruments: {
            include: {
              instrument: true
            }
          }
        },
      },
      sets: {
        include: {
          setType: true,
          band: true,
          setMusicians: {
            include: {
              musician: true,
              instruments: {
                include: {
                  instrument: true
                }
              }
            },
          },
          performances: {
            include: {
              leadVocals: {
                select: {
                  id: true,
                  name: true,
                }
              },
              song: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  songTags: {
                    include: {
                      tag: {
                        select: {
                          id: true,
                          name: true,
                        }
                      }
                    }
                  },
                  leadVocals: {
                    select: {
                      id: true,
                      name: true,
                    }
                  }
                }
              },
              performanceMusicians: {
                include: {
                  musician: true,
                  instruments: {
                    include: {
                      instrument: true
                    }
                  }
                },
              },
              showBanter: true,
            },
            orderBy: { performanceOrder: 'asc' },
          },
        },
        orderBy: { position: 'asc' },
      },
      recordings: {
        include: {
          recordingType: true,
          contributor: true,
        },
      },
      eventContributors: {
        include: {
          contributor: true,
        },
      },
      links: {
        include: {
          linkType: true,
        },
      },
    },
  });

  if (!event || !event.isPublic) {
    return { event: null, prevEvent: null, nextEvent: null };
  }

  let prevEvent = null;
  let nextEvent = null;
  if (event?.sortDate) {
    prevEvent = await prisma.event.findFirst({
      where: {
        isPublic: true,
        OR: [
          { sortDate: { lt: event.sortDate } },
          {
            sortDate: event.sortDate,
            id: { lt: event.id }
          }
        ]
      },
      orderBy: [
        { sortDate: 'desc' },
        { id: 'desc' }
      ],
      select: { id: true, slug: true, displayDate: true, sortDate: true },
    });
    nextEvent = await prisma.event.findFirst({
      where: {
        isPublic: true,
        OR: [
          { sortDate: { gt: event.sortDate } },
          {
            sortDate: event.sortDate,
            id: { gt: event.id }
          }
        ]
      },
      orderBy: [
        { sortDate: 'asc' },
        { id: 'asc' }
      ],
      select: { id: true, slug: true, displayDate: true, sortDate: true },
    });
  }

  return { event, prevEvent, nextEvent };
}