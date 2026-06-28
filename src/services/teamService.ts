import { supabase } from '../supabase/client';
import { StudyTeam } from '../types';

export function mapTeamFromDB(dbTeam: any, isJoined: boolean): StudyTeam {
  return {
    id: dbTeam.id,
    name: dbTeam.name,
    description: dbTeam.description || '',
    category: dbTeam.category,
    skillsRequired: dbTeam.skills_required || [],
    membersCount: Number(dbTeam.members_count || 0),
    maxMembers: Number(dbTeam.max_members || 10),
    joined: isJoined,
    imageColor: dbTeam.image_color || 'from-[#eaff00] to-yellow-400',
    createdBy: dbTeam.created_by || ''
  };
}

export async function fetchAllTeams(userId: string): Promise<StudyTeam[]> {
  const { data: teamsData, error: teamsError } = await supabase
    .from('teams')
    .select('*')
    .order('created_at', { ascending: false });

  if (teamsError) throw teamsError;

  const { data: joinedData, error: joinedError } = await supabase
    .from('team_members')
    .select('team_id, user_id');

  if (joinedError) throw joinedError;

  const joinedTeamIds = new Set(
    (joinedData || [])
      .filter(item => item.user_id === userId)
      .map(item => item.team_id)
  );
  const memberCounts = (joinedData || []).reduce<Record<string, number>>((counts, item) => {
    counts[item.team_id] = (counts[item.team_id] || 0) + 1;
    return counts;
  }, {});
  const creatorIds = [...new Set((teamsData || []).map(team => team.created_by).filter(Boolean))];
  const { data: creatorsData } = creatorIds.length
    ? await supabase.from('profiles').select('id, name').in('id', creatorIds)
    : { data: [] };
  const creatorNames = new Map((creatorsData || []).map(profile => [profile.id, profile.name]));

  return (teamsData || []).map(team => mapTeamFromDB(
    {
      ...team,
      members_count: memberCounts[team.id] || team.members_count || 0,
      created_by: creatorNames.get(team.created_by) || team.created_by
    },
    joinedTeamIds.has(team.id)
  ));
}

export async function createTeam(
  teamData: Omit<StudyTeam, 'id' | 'membersCount' | 'joined'>,
  userId: string
): Promise<StudyTeam> {
  const { data: insertedTeam, error: teamError } = await supabase
    .from('teams')
    .insert({
      name: teamData.name,
      description: teamData.description,
      category: teamData.category,
      skills_required: teamData.skillsRequired,
      members_count: 1,
      max_members: teamData.maxMembers,
      image_color: teamData.imageColor,
      created_by: userId
    })
    .select('*')
    .single();

  if (teamError) throw teamError;

  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      team_id: insertedTeam.id,
      user_id: userId
    });

  if (memberError) throw memberError;

  return {
    ...mapTeamFromDB(insertedTeam, true),
    createdBy: teamData.createdBy
  };
}

export async function joinTeam(teamId: string, userId: string): Promise<void> {
  const { error: joinError } = await supabase
    .from('team_members')
    .insert({ team_id: teamId, user_id: userId });

  if (joinError) throw joinError;
}

export async function leaveTeam(teamId: string, userId: string): Promise<void> {
  const { error: leaveError } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId);

  if (leaveError) throw leaveError;
}
