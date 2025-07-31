import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../lib/database';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const priority = formData.get('priority') as string;
    const location = formData.get('location') as string;
    const latitude = formData.get('latitude') as string;
    const longitude = formData.get('longitude') as string;
    const reportedBy = formData.get('reportedBy') as string;
    const reportedByUserId = formData.get('reportedByUserId') as string;
    
    // Extract uploaded files
    const files = formData.getAll('images') as File[];

    // Basic validation
    if (!title || !description || !category || !location || !reportedBy) {
      return NextResponse.json(
        { error: 'Title, description, category, location, and reporter are required' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['infrastructure', 'safety', 'environment', 'transportation', 'utilities', 'other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'issues');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Process uploaded images
    const imagePaths: string[] = [];
    
    for (const file of files) {
      if (file.size > 0) {
        // Generate unique filename
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2);
        const extension = path.extname(file.name);
        const filename = ${timestamp}-${randomSuffix}${extension};
        
        // Save file
        const filePath = path.join(uploadsDir, filename);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        await writeFile(filePath, buffer);
        
        // Store relative path for database
        imagePaths.push(/uploads/issues/${filename});
      }
    }

    // Generate issue ID
    const issueId = ISS${Date.now()};

    // Get database connection
    const db = await getDatabase();

    // Insert new issue
    const result = await db.run(`
      INSERT INTO issues (
        id, title, description, category, priority, status, location, 
        latitude, longitude, reportedBy, reportedByUserId, images, 
        reporterAvatar, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      issueId,
      title,
      description,
      category,
      priority || 'medium',
      'open',
      location,
      latitude ? parseFloat(latitude) : null,
      longitude ? parseFloat(longitude) : null,
      reportedBy,
      reportedByUserId ? parseInt(reportedByUserId) : null,
      JSON.stringify(imagePaths),
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face', // Default avatar
      new Date().toISOString()
    ]);

    // Get the created issue
    const newIssue = await db.get(
      'SELECT * FROM issues WHERE id = ?',
      [issueId]
    );

    // Parse images JSON
    if (newIssue.images) {
      newIssue.images = JSON.parse(newIssue.images);
    }

    return NextResponse.json(
      {
        message: 'Issue created successfully',
        issue: newIssue
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create issue error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');

    // Get database connection
    const db = await getDatabase();

    // Build query
    let query = 'SELECT * FROM issues WHERE 1=1';
    const params: any[] = [];

    if (userId) {
      query += ' AND reportedByUserId = ?';
      params.push(parseInt(userId));
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY createdAt DESC';

    // Get issues
    const issues = await db.all(query, params);

    // Parse images JSON for each issue
    issues.forEach((issue: any) => {
      if (issue.images) {
        try {
          issue.images = JSON.parse(issue.images);
        } catch (e) {
          issue.images = [];
        }
      } else {
        issue.images = [];
      }
    });

    return NextResponse.json(
      {
        issues,
        count: issues.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get issues error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const issueId = searchParams.get('id');
    
    if (!issueId) {
      return NextResponse.json(
        { error: 'Issue ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, userRole } = body;

    // Check if user has admin privileges
    if (userRole !== 'admin' && userRole !== 'super-admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Validate status
    const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: open, in-progress, resolved, closed' },
        { status: 400 }
      );
    }

    // Get database connection
    const db = await getDatabase();

    // Check if issue exists
    const existingIssue = await db.get(
      'SELECT * FROM issues WHERE id = ?',
      [issueId]
    );

    if (!existingIssue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    // Update issue status
    await db.run(
      'UPDATE issues SET status = ?, updatedAt = ? WHERE id = ?',
      [status, new Date().toISOString(), issueId]
    );

    // Get the updated issue
    const updatedIssue = await db.get(
      'SELECT * FROM issues WHERE id = ?',
      [issueId]
    );

    // Parse images JSON
    if (updatedIssue.images) {
      try {
        updatedIssue.images = JSON.parse(updatedIssue.images);
      } catch (e) {
        updatedIssue.images = [];
      }
    } else {
      updatedIssue.images = [];
    }

    return NextResponse.json(
      {
        message: 'Issue status updated successfully',
        issue: updatedIssue
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Update issue status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
